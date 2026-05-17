#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import proj4 from "proj4";

proj4.defs(
  "EPSG:5179",
  "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs",
);

const UPSTREAM_REPO = "hosungseo/gonpunclaw-policymap";
const CACHE_PATH = path.join(".cache", "policymap-geocoder-cache.json");

function argsAll(name) {
  const out = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === "--" + name && process.argv[i + 1]) out.push(process.argv[i + 1]);
  }
  return out;
}
function arg(name, fallback = "") {
  return argsAll(name).at(-1) || fallback;
}
function hasFlag(name) {
  return process.argv.includes("--" + name);
}
function loadDotEnvLocal() {
  const file = ".env.local";
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}
function keyState(keys) {
  return Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, Boolean(v)]));
}
function enabledProviders(priority, keys) {
  return priority.filter((name) => {
    if (name === "kakao") return Boolean(keys.kakao);
    if (name === "vworld") return Boolean(keys.vworld);
    if (name === "juso") return Boolean(keys.juso);
    return false;
  });
}
function readCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}
function writeCache(cache) {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}
function cacheKey(address, priority) {
  return JSON.stringify({ address, priority });
}
function parseAddresses() {
  const direct = argsAll("address").flatMap((v) => v.split(/\n/));
  const file = arg("addresses-file", "");
  const fromFile = file && fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/) : [];
  return [...direct, ...fromFile].map((s) => s.trim()).filter(Boolean);
}
function fetchWithTimeout(url, options = {}, timeoutMs = 8000, fetchImpl = fetch) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  return fetchImpl(url, { ...options, signal: ac.signal }).finally(() => clearTimeout(timer));
}
async function geocodeKakao(address, apiKey, timeoutMs, fetchImpl = fetch) {
  if (!apiKey) return { ok: false, reason: "DISABLED" };
  const url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + encodeURIComponent(address) + "&size=1";
  let res;
  try {
    res = await fetchWithTimeout(url, { headers: { Authorization: "KakaoAK " + apiKey } }, timeoutMs, fetchImpl);
  } catch (e) {
    return { ok: false, reason: "NETWORK:" + e.message };
  }
  if (!res.ok) return { ok: false, reason: "HTTP:" + res.status };
  const json = await res.json();
  const doc = json.documents?.[0];
  if (!doc) return { ok: false, reason: "NO_MATCH" };
  return {
    ok: true,
    lat: Number(doc.y),
    lng: Number(doc.x),
    address_normalized: doc.address_name || address,
    provider: "kakao",
  };
}
async function geocodeVWorld(address, apiKey, timeoutMs, fetchImpl = fetch) {
  if (!apiKey) return { ok: false, reason: "DISABLED" };
  for (const category of ["road", "parcel"]) {
    const q = new URLSearchParams({
      service: "search",
      request: "search",
      version: "2.0",
      crs: "EPSG:4326",
      size: "1",
      page: "1",
      query: address,
      type: "address",
      category,
      format: "json",
      key: apiKey,
    });
    let res;
    try {
      res = await fetchWithTimeout("https://api.vworld.kr/req/search?" + q.toString(), {}, timeoutMs, fetchImpl);
    } catch (e) {
      return { ok: false, reason: "NETWORK:" + e.message };
    }
    if (!res.ok) continue;
    const json = await res.json();
    if (json.response?.status === "ERROR") return { ok: false, reason: "VWORLD:" + (json.response.error?.code || "UNKNOWN") };
    const item = json.response?.result?.items?.[0];
    if (json.response?.status === "OK" && item?.point) {
      return {
        ok: true,
        lat: Number(item.point.y),
        lng: Number(item.point.x),
        address_normalized: item.address?.road || item.address?.parcel || address,
        provider: "vworld",
      };
    }
  }
  return { ok: false, reason: "NO_MATCH" };
}
async function geocodeJuso(address, apiKey, timeoutMs, fetchImpl = fetch) {
  if (!apiKey) return { ok: false, reason: "DISABLED" };
  const norm = new URLSearchParams({
    confmKey: apiKey,
    currentPage: "1",
    countPerPage: "1",
    keyword: address,
    resultType: "json",
  });
  let res;
  try {
    res = await fetchWithTimeout("https://business.juso.go.kr/addrlink/addrLinkApi.do?" + norm.toString(), {}, timeoutMs, fetchImpl);
  } catch (e) {
    return { ok: false, reason: "NETWORK:" + e.message };
  }
  if (!res.ok) return { ok: false, reason: "HTTP:" + res.status };
  const normJson = await res.json();
  if (normJson.results?.common?.errorCode !== "0") return { ok: false, reason: "JUSO:" + (normJson.results?.common?.errorCode || "UNKNOWN") };
  const hit = normJson.results?.juso?.[0];
  if (!hit) return { ok: false, reason: "NO_MATCH" };
  const coord = new URLSearchParams({
    confmKey: apiKey,
    admCd: hit.admCd,
    rnMgtSn: hit.rnMgtSn,
    udrtYn: hit.udrtYn,
    buldMnnm: String(hit.buldMnnm),
    buldSlno: String(hit.buldSlno),
    resultType: "json",
  });
  let coordRes;
  try {
    coordRes = await fetchWithTimeout("https://business.juso.go.kr/addrlink/addrCoordApi.do?" + coord.toString(), {}, timeoutMs, fetchImpl);
  } catch (e) {
    return { ok: false, reason: "COORD_NETWORK:" + e.message };
  }
  if (!coordRes.ok) return { ok: false, reason: "COORD_HTTP:" + coordRes.status };
  const coordJson = await coordRes.json();
  const pt = coordJson.results?.juso?.[0];
  if (!pt) return { ok: false, reason: "NO_COORD" };
  const [lng, lat] = proj4("EPSG:5179", "WGS84", [Number(pt.entX), Number(pt.entY)]);
  return {
    ok: true,
    lat,
    lng,
    address_normalized: hit.roadAddr || hit.jibunAddr || address,
    provider: "juso",
  };
}
async function geocodeOne(address, priority, keys, options = {}) {
  const attempted = [];
  const failures = [];
  for (const provider of priority) {
    let result;
    if (provider === "kakao") result = await geocodeKakao(address, keys.kakao, options.timeoutMs, options.fetchImpl);
    else if (provider === "vworld") result = await geocodeVWorld(address, keys.vworld, options.timeoutMs, options.fetchImpl);
    else if (provider === "juso") result = await geocodeJuso(address, keys.juso, options.timeoutMs, options.fetchImpl);
    else continue;
    if (result.reason !== "DISABLED") attempted.push(provider);
    if (result.ok) return { address_raw: address, attempted, ...result };
    failures.push({ provider, reason: result.reason });
  }
  const reason = attempted.length ? failures.at(-1)?.reason || "ALL_FAILED" : "NO_ENABLED_PROVIDER";
  return { address_raw: address, ok: false, reason, attempted, failures };
}
async function runSelfTest() {
  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes("dapi.kakao.com")) return new Response(JSON.stringify({ documents: [] }));
    if (String(url).includes("api.vworld.kr")) {
      return new Response(JSON.stringify({
        response: {
          status: "OK",
          result: { items: [{ address: { road: "서울특별시 중구 세종대로 110" }, point: { x: "126.9784", y: "37.5665" } }] },
        },
      }));
    }
    return new Response(JSON.stringify({}));
  };
  const result = await geocodeOne(
    "서울특별시 중구 세종대로 110",
    ["kakao", "vworld", "juso"],
    { kakao: "TEST", vworld: "TEST", juso: "" },
    { timeoutMs: 1000, fetchImpl: fakeFetch },
  );
  if (!result.ok || result.provider !== "vworld" || result.attempted.join(",") !== "kakao,vworld") {
    throw new Error("self-test failed: " + JSON.stringify(result));
  }
  return { ok: true, calls: calls.length, result };
}
function renderMd(payload) {
  const lines = [
    "# PolicyMap Geocoder Bridge",
    "",
    "- Upstream: " + payload.upstream_repo,
    "- Strategy: " + payload.strategy,
    "- Priority: " + payload.priority.join(", "),
    "- Enabled providers: " + (payload.enabled_providers.join(", ") || "none"),
    "- Success: " + payload.summary.ok + " / " + payload.summary.total,
    "",
  ];
  if (payload.summary.total && !payload.enabled_providers.length) {
    lines.push("No geocoder API keys are configured. Set KAKAO_REST_API_KEY, VWORLD_API_KEY, or JUSO_API_KEY.");
    lines.push("");
  }
  for (const row of payload.results) {
    lines.push("## " + row.address_raw);
    if (row.ok) {
      lines.push("- Provider: " + row.provider);
      lines.push("- Lat/Lng: " + row.lat + ", " + row.lng);
      lines.push("- Normalized: " + row.address_normalized);
      lines.push("- Attempted: " + row.attempted.join(", "));
    } else {
      lines.push("- Failed: " + row.reason);
      lines.push("- Attempted: " + (row.attempted.join(", ") || "none"));
    }
    lines.push("");
  }
  return lines.join("\n");
}

loadDotEnvLocal();

if (hasFlag("self-test")) {
  const result = await runSelfTest();
  console.log(JSON.stringify({ source: "policymap-geocoder-bridge", self_test: result }, null, 2));
  process.exit(0);
}

const priority = arg("priority", process.env.GEOCODER_PRIORITY || "kakao,vworld,juso")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const keys = {
  kakao: process.env.KAKAO_REST_API_KEY || "",
  vworld: process.env.VWORLD_API_KEY || "",
  juso: process.env.JUSO_API_KEY || "",
};
const addresses = parseAddresses();
if (!addresses.length) {
  console.error("Provide --address ADDRESS or --addresses-file PATH. Use --self-test for fixture verification.");
  process.exit(2);
}
const timeoutMs = Number(arg("timeout-ms", "8000"));
const useCache = !hasFlag("no-cache");
const cache = useCache ? readCache() : {};
const results = [];
for (const address of addresses) {
  const key = cacheKey(address, priority);
  if (useCache && cache[key]) {
    results.push({ ...cache[key], cached: true });
    continue;
  }
  const result = await geocodeOne(address, priority, keys, { timeoutMs });
  results.push(result);
  if (useCache && result.ok) {
    cache[key] = result;
    writeCache(cache);
  }
}
const summary = {
  total: results.length,
  ok: results.filter((r) => r.ok).length,
  failed: results.filter((r) => !r.ok).length,
  providers: Object.fromEntries(["kakao", "vworld", "juso"].map((p) => [p, results.filter((r) => r.ok && r.provider === p).length])),
};
const payload = {
  source: "policymap-geocoder-bridge",
  upstream_repo: UPSTREAM_REPO,
  strategy: "KEYED_API_CHAIN",
  generated_at: new Date().toISOString(),
  priority,
  enabled_providers: enabledProviders(priority, keys),
  key_state: keyState(keys),
  cache: { enabled: useCache, path: CACHE_PATH },
  summary,
  results,
};

if (arg("format", "md") === "json") console.log(JSON.stringify(payload, null, 2));
else console.log(renderMd(payload));
if (addresses.length && !summary.ok) process.exitCode = 1;
