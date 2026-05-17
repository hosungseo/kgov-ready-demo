#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_DATA_ROOT = "/Users/seohoseong/.openclaw/workspace/gonpunclaw-policymap/public/data";
const DATA_ROOT = process.env.POLICYMAP_DATA_ROOT || DEFAULT_DATA_ROOT;
const LEVELS = {
  sido: { file: "sido-boundaries.geojson", code: "ctprvn_cd", name: "ctp_kor_nm", fullName: "ctp_kor_nm" },
  sigg: { file: "sigg-boundaries.geojson", code: "sig_cd", name: "sig_kor_nm", fullName: "full_nm" },
  emd: { file: "emd-boundaries.geojson", code: "emd_cd", name: "emd_kor_nm", fullName: "full_nm" },
};

function argsAll(name) {
  const out = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === "--" + name && process.argv[i + 1]) out.push(process.argv[i + 1]);
  }
  return out.flatMap((value) => String(value).split(/\n/)).map((value) => value.trim()).filter(Boolean);
}
function arg(name, fallback = "") {
  return argsAll(name).at(-1) || fallback;
}
function hasFlag(name) {
  return process.argv.includes("--" + name);
}
function normalize(value) {
  return String(value || "")
    .replace(/특별자치시/g, "")
    .replace(/특별자치도/g, "")
    .replace(/특별시/g, "")
    .replace(/광역시/g, "")
    .replace(/자치구/g, "구")
    .replace(/\s+/g, "")
    .trim();
}
function compact(value) {
  return String(value || "").replace(/\s+/g, "");
}
function readGeoJson(level) {
  const config = LEVELS[level];
  if (!config) throw new Error("Unknown level: " + level);
  const file = path.join(DATA_ROOT, config.file);
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  return json.features || [];
}
function property(feature, key) {
  return feature?.properties?.[key] ?? "";
}
function regionName(level, feature) {
  const config = LEVELS[level];
  return property(feature, config.fullName) || property(feature, config.name);
}
function regionCode(level, feature) {
  return String(property(feature, LEVELS[level].code));
}
function collectPoints(coords, out = []) {
  if (!Array.isArray(coords)) return out;
  if (typeof coords[0] === "number" && typeof coords[1] === "number") {
    out.push(coords);
    return out;
  }
  for (const child of coords) collectPoints(child, out);
  return out;
}
function bboxCenter(geometry) {
  const points = collectPoints(geometry?.coordinates || []);
  if (!points.length) return null;
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of points) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  if (!Number.isFinite(minLng) || !Number.isFinite(minLat)) return null;
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}
function levelsFromArgs() {
  return arg("level", "sigg,sido").split(",").map((level) => level.trim()).filter((level) => LEVELS[level]);
}
function queriesFromArgs() {
  const queries = [...argsAll("query"), ...argsAll("address"), ...argsAll("region")];
  return queries.length ? queries : ["세종특별자치시", "대전광역시 서구", "서울특별시 영등포구"];
}
function scoreMatch(query, level, feature) {
  const full = regionName(level, feature);
  const name = property(feature, LEVELS[level].name);
  const code = regionCode(level, feature);
  const qCompact = compact(query);
  const qNorm = normalize(query);
  const fullCompact = compact(full);
  const fullNorm = normalize(full);
  const nameNorm = normalize(name);
  if (code && (qCompact === code || qCompact.includes("코드" + code))) return 100;
  if (fullCompact && qCompact.includes(fullCompact)) return 95;
  if (fullNorm && qNorm.includes(fullNorm)) return 90;
  if (nameNorm && qNorm.includes(nameNorm)) return level === "sido" ? 70 : 62;
  if (fullNorm && fullNorm.includes(qNorm) && qNorm.length >= 2) return 55;
  return 0;
}
function matchQuery(query, levels) {
  const matches = [];
  for (const level of levels) {
    for (const feature of readGeoJson(level)) {
      const score = scoreMatch(query, level, feature);
      if (!score) continue;
      const center = bboxCenter(feature.geometry);
      if (!center) continue;
      matches.push({ level, feature, score, center });
    }
  }
  const rank = { emd: 3, sigg: 2, sido: 1 };
  matches.sort((a, b) => b.score - a.score || rank[b.level] - rank[a.level] || regionName(a.level, a.feature).length - regionName(b.level, b.feature).length);
  return matches[0] || null;
}
function buildPayload() {
  const levels = levelsFromArgs();
  const queries = queriesFromArgs();
  const limit = Number(arg("limit", String(queries.length))) || queries.length;
  const seen = new Set();
  const items = [];
  for (const query of queries) {
    const match = matchQuery(query, levels);
    if (!match) {
      items.push({ query, ok: false, reason: "NO_REGION_MATCH" });
      continue;
    }
    const code = regionCode(match.level, match.feature);
    const key = match.level + ":" + code;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      query,
      ok: true,
      level: match.level,
      code,
      name: regionName(match.level, match.feature),
      score: match.score,
      centroid: { lng: match.center[0], lat: match.center[1] },
      properties: match.feature.properties,
      geometry: hasFlag("include-boundary") ? match.feature.geometry : null,
    });
    if (items.filter((item) => item.ok).length >= limit) break;
  }
  const geojson = {
    type: "FeatureCollection",
    features: items.filter((item) => item.ok).map((item) => ({
      type: "Feature",
      geometry: item.geometry || { type: "Point", coordinates: [item.centroid.lng, item.centroid.lat] },
      properties: {
        source: "policymap-region-bridge",
        query: item.query,
        level: item.level,
        code: item.code,
        name: item.name,
        centroid_lng: item.centroid.lng,
        centroid_lat: item.centroid.lat,
        match_score: item.score,
        geometry_kind: item.geometry ? "boundary" : "centroid",
      },
    })),
  };
  return {
    source: "policymap-region-bridge",
    upstream_repo: "hosungseo/gonpunclaw-policymap",
    data_root: DATA_ROOT,
    generated_at: new Date().toISOString(),
    strategy: "LOCAL_BOUNDARY_GEOJSON_CENTROID",
    levels,
    summary: {
      total: queries.length,
      ok: items.filter((item) => item.ok).length,
      failed: items.filter((item) => !item.ok).length,
    },
    items,
    geojson,
  };
}
function renderMd(payload) {
  const lines = [
    "# Policymap Region Bridge",
    "",
    "- Strategy: " + payload.strategy,
    "- Upstream: " + payload.upstream_repo,
    "- Regions: " + payload.summary.ok + "/" + payload.summary.total,
    "",
    "## Matches",
    "",
  ];
  for (const item of payload.items) {
    if (item.ok) lines.push("- " + item.query + " -> " + item.name + " [" + item.level + " " + item.code + "] (" + item.centroid.lat + ", " + item.centroid.lng + ")");
    else lines.push("- " + item.query + " -> " + item.reason);
  }
  lines.push("", "## GeoJSON", "", "\`\`\`json", JSON.stringify(payload.geojson, null, 2), "\`\`\`");
  return lines.join("\n");
}

const payload = buildPayload();
if (arg("format", "md") === "json") console.log(JSON.stringify(payload, null, 2));
else console.log(renderMd(payload));
