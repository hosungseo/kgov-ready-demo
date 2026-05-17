#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const AGENCIES = [
  { terms: ["조달청"], name: "조달청", address: "대전광역시 서구 청사로 189 정부대전청사", role: "lead agency" },
  { terms: ["행정안전부", "행안부"], name: "행정안전부", address: "세종특별자치시 도움6로 42 정부세종청사 중앙동", role: "ministry" },
  { terms: ["교육부"], name: "교육부", address: "세종특별자치시 갈매로 408 정부세종청사 14동", role: "ministry" },
  { terms: ["법무부"], name: "법무부", address: "경기도 과천시 관문로 47 정부과천청사", role: "ministry" },
  { terms: ["국토교통부", "국토부"], name: "국토교통부", address: "세종특별자치시 도움6로 11 정부세종청사", role: "ministry" },
  { terms: ["산업통상자원부", "산업부"], name: "산업통상자원부", address: "세종특별자치시 한누리대로 402 정부세종청사", role: "ministry" },
  { terms: ["기획재정부", "기재부"], name: "기획재정부", address: "세종특별자치시 갈매로 477 정부세종청사", role: "ministry" },
  { terms: ["국회", "의안", "상임위"], name: "국회", address: "서울특별시 영등포구 의사당대로 1", role: "assembly" },
  { terms: ["정부서울청사"], name: "정부서울청사", address: "서울특별시 종로구 세종대로 209", role: "government complex" },
  { terms: ["정부세종청사"], name: "정부세종청사", address: "세종특별자치시 도움6로 11", role: "government complex" },
];

function arg(name, fallback = "") {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function argsAll(name) {
  const out = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === "--" + name && process.argv[i + 1]) out.push(process.argv[i + 1]);
  }
  return out;
}
function shellQuote(s) {
  const v = String(s || "");
  return /^[A-Za-z0-9_./:-]+$/.test(v) ? v : "\"" + v.replace(/"/g, "\\\"") + "\"";
}
function haystack() {
  return [
    arg("topic", "공급망"),
    arg("policy-query", "조달청"),
    arg("law-query", "정부조직법"),
    arg("schedule-keyword", ""),
    arg("gov24-keyword", ""),
  ].join(" ");
}
function candidateRows() {
  const text = haystack();
  const explicit = argsAll("address").map((address, i) => ({
    id: "explicit-" + (i + 1),
    name: "사용자 지정 주소 " + (i + 1),
    role: "explicit",
    address,
    matched_by: "address",
  }));
  const inferred = AGENCIES
    .filter((row) => row.terms.some((term) => text.includes(term)))
    .map((row) => ({
      id: row.name,
      name: row.name,
      role: row.role,
      address: row.address,
      matched_by: row.terms.find((term) => text.includes(term)) || row.terms[0],
    }));
  const seen = new Set();
  return [...explicit, ...inferred].filter((row) => {
    const key = row.address;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function parseJson(stdout) {
  const start = String(stdout || "").indexOf("{");
  if (start < 0) return null;
  try {
    return JSON.parse(stdout.slice(start));
  } catch {
    return null;
  }
}
function runGeocoder(candidates) {
  if (!candidates.length) return null;
  const args = [];
  for (const row of candidates) args.push("--address", row.address);
  args.push("--format", "json");
  const r = spawnSync("node", ["scripts/policymap-geocoder-bridge.mjs", ...args], {
    encoding: "utf8",
    env: process.env,
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    command: ["node", "scripts/policymap-geocoder-bridge.mjs", ...args].map(shellQuote).join(" "),
    status: typeof r.status === "number" ? r.status : 1,
    stdout: r.stdout || "",
    stderr: r.stderr || r.error?.message || "",
    parsed: parseJson(r.stdout),
  };
}
function runRegionBridge(candidates) {
  const args = [];
  for (const row of candidates) args.push("--address", row.address);
  for (const region of argsAll("region")) args.push("--region", region);
  if (!args.length) args.push("--query", haystack());
  args.push("--format", "json");
  const r = spawnSync("node", ["scripts/policymap-region-bridge.mjs", ...args], {
    encoding: "utf8",
    env: process.env,
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    command: ["node", "scripts/policymap-region-bridge.mjs", ...args].map(shellQuote).join(" "),
    status: typeof r.status === "number" ? r.status : 1,
    stdout: r.stdout || "",
    stderr: r.stderr || r.error?.message || "",
    parsed: parseJson(r.stdout),
  };
}
function toFeatureCollection(candidates, geocode, region) {
  const byAddress = new Map((geocode?.results || []).map((row) => [row.address_raw, row]));
  const regionByQuery = new Map((region?.items || []).filter((row) => row.ok).map((row) => [row.query, row]));
  return {
    type: "FeatureCollection",
    features: candidates.flatMap((candidate) => {
      const hit = byAddress.get(candidate.address);
      if (!hit?.ok) {
        const regionHit = regionByQuery.get(candidate.address);
        if (!regionHit?.ok) return [];
        return [{
          type: "Feature",
          geometry: { type: "Point", coordinates: [regionHit.centroid.lng, regionHit.centroid.lat] },
          properties: {
            id: candidate.id,
            name: candidate.name,
            role: candidate.role,
            address_raw: candidate.address,
            provider: "policymap-region",
            precision: "administrative-region-centroid",
            region_level: regionHit.level,
            region_code: regionHit.code,
            region_name: regionHit.name,
            match_score: regionHit.score,
          },
        }];
      }
      return [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [hit.lng, hit.lat] },
        properties: {
          id: candidate.id,
          name: candidate.name,
          role: candidate.role,
          address_raw: candidate.address,
          address_normalized: hit.address_normalized,
          provider: hit.provider,
          precision: "address-geocode",
          attempted: hit.attempted,
        },
      }];
    }),
  };
}
function buildPayload() {
  const candidates = candidateRows();
  const run = runGeocoder(candidates);
  const geocode = run?.parsed || null;
  const regionRun = runRegionBridge(candidates);
  const region = regionRun?.parsed || null;
  const geojson = toFeatureCollection(candidates, geocode, region);
  const enabled = geocode?.enabled_providers || [];
  const hasExact = geojson.features.some((feature) => feature.properties?.precision === "address-geocode");
  const hasRegion = geojson.features.some((feature) => feature.properties?.precision === "administrative-region-centroid");
  const status = !candidates.length
    ? "no-location-candidates"
    : hasExact
      ? "map-ready"
      : hasRegion
        ? "map-ready-region"
      : enabled.length
        ? "geocode-failed"
        : "needs-region-match-or-geocoder-key";
  return {
    source: "issue-geo-context",
    topic: arg("topic", "공급망"),
    generated_at: new Date().toISOString(),
    status,
    candidates,
    geocoder: geocode ? {
      status: run.status,
      command: run.command,
      enabled_providers: enabled,
      key_state: geocode.key_state,
      summary: geocode.summary,
      results: geocode.results,
    } : null,
    region: region ? {
      status: regionRun.status,
      command: regionRun.command,
      strategy: region.strategy,
      levels: region.levels,
      summary: region.summary,
      items: region.items,
    } : null,
    geojson,
  };
}
function renderMd(payload) {
  const lines = [
    "# Issue Geo Context — " + payload.topic,
    "",
    "- Generated: " + payload.generated_at,
    "- Status: " + payload.status,
    "- Candidates: " + payload.candidates.length,
    "- GeoJSON features: " + payload.geojson.features.length,
    "",
  ];
  if (payload.status === "needs-region-match-or-geocoder-key") {
    lines.push("No administrative region matched. Pass `--region` or configure a geocoder with `KAKAO_REST_API_KEY`, `VWORLD_API_KEY`, or `JUSO_API_KEY`.");
    lines.push("");
  }
  lines.push("## Candidates", "");
  if (!payload.candidates.length) lines.push("- No location candidates inferred. Pass `--address` to add one.");
  for (const row of payload.candidates) {
    lines.push("- " + row.name + " [" + row.role + "] — " + row.address + " (matched: " + row.matched_by + ")");
  }
  if (payload.geocoder?.results?.length) {
    lines.push("", "## Geocode Results", "");
    for (const row of payload.geocoder.results) {
      if (row.ok) lines.push("- ok: " + row.address_raw + " → " + row.lat + ", " + row.lng + " via " + row.provider);
      else lines.push("- failed: " + row.address_raw + " → " + row.reason);
    }
  }
  if (payload.region?.items?.length) {
    lines.push("", "## Region Results", "");
    for (const row of payload.region.items) {
      if (row.ok) lines.push("- ok: " + row.query + " -> " + row.name + " [" + row.level + " " + row.code + "] centroid " + row.centroid.lat + ", " + row.centroid.lng);
      else lines.push("- failed: " + row.query + " -> " + row.reason);
    }
  }
  lines.push("", "## GeoJSON", "", "```json", JSON.stringify(payload.geojson, null, 2), "```");
  return lines.join("\n");
}

const payload = buildPayload();
if (arg("format", "md") === "json") console.log(JSON.stringify(payload, null, 2));
else console.log(renderMd(payload));
