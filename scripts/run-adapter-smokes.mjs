#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

function loadEnvFile(path = ".env.local") {
  if (!existsSync(path)) return [];
  const loaded = [];
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
    loaded.push(key);
  }
  return loaded;
}

function run(name, cmd, opts = {}) {
  console.log(`\n## ${name}`);
  if (opts.require?.some((key) => !process.env[key])) {
    console.log(`SKIP missing env: ${opts.require.filter((key) => !process.env[key]).join(", ")}`);
    return { name, skipped: true };
  }
  const result = spawnSync(cmd[0], cmd.slice(1), {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    env: process.env,
  });
  const redact = (text) => text.replace(/(serviceKey|KEY|OC)=([^&"\s]+)/g, "$1=***");
  if (result.stdout) console.log(redact(result.stdout.slice(0, opts.maxOut ?? 2500)));
  if (result.stderr) console.error(redact(result.stderr.slice(0, 1200)));
  console.log(`EXIT ${result.status}`);
  return { name, status: result.status };
}

const loaded = loadEnvFile();
console.log(`Loaded local env keys: ${loaded.length ? loaded.join(", ") : "none"}`);

const results = [
  run("policy briefing search/detail", ["pnpm", "adapter:smoke"], { maxOut: 3000 }),
  run("policy briefing readable", ["pnpm", "adapter:press:read"], { maxOut: 1800 }),
  run("policy news API", ["node", "scripts/policy-news.mjs", "--start", "20250515", "--end", "20250517", "--limit", "3"], { require: ["DATA_GO_KR_SERVICE_KEY"], maxOut: 1800 }),
  run("gazette metadata", ["node", "scripts/gazette-search.mjs", "--from", "2026-05-01", "--to", "2026-05-17", "--keyword", "고시", "--page-size", "3"], { require: ["GAZETTE_API_KEY"] }),
  run("assembly bill", ["node", "scripts/assembly-bill.mjs", "search", "--endpoint", "ALLBILLV2", "--eraco", "제22대", "--limit", "3"], { require: ["ASSEMBLY_API_KEY"] }),
  run("moleg law", ["node", "scripts/moleg-law.mjs", "search", "--query", "정부조직법", "--limit", "3"], { require: ["MOLEG_OC"] }),
  run("moleg law history", ["node", "scripts/moleg-law.mjs", "history", "--query", "정부조직법", "--limit", "3"], { require: ["MOLEG_OC"], maxOut: 1800 }),
  run("odcloud central function", ["node", "scripts/odcloud-gov.mjs", "dataset", "--dataset", "centralFunction", "--limit", "3"], { require: ["DATA_GO_KR_SERVICE_KEY"], maxOut: 1800 }),
  run("gov24 service search", ["node", "scripts/odcloud-gov.mjs", "gov24", "--keyword", "보육", "--limit", "3"], { require: ["DATA_GO_KR_SERVICE_KEY"], maxOut: 1800 }),
  run("ecos base rate", ["node", "scripts/ecos-stat.mjs", "series", "--series", "baseRate", "--start", "202501", "--end", "202604", "--limit", "20"], { require: ["ECOS_API_KEY"], maxOut: 1800 }),
  run("molit apt trade", ["node", "scripts/molit-realestate.mjs", "--kind", "aptTrade", "--lawd", "36110", "--ym", "202604", "--limit", "3"], { require: ["DATA_GO_KR_SERVICE_KEY"], maxOut: 1800 }),
  run("molit apt rent", ["node", "scripts/molit-realestate.mjs", "--kind", "aptRent", "--lawd", "36110", "--ym", "202604", "--limit", "3"], { require: ["DATA_GO_KR_SERVICE_KEY"], maxOut: 1400 }),
  run("molit officetel trade", ["node", "scripts/molit-realestate.mjs", "--kind", "officetelTrade", "--lawd", "36110", "--ym", "202604", "--limit", "3"], { require: ["DATA_GO_KR_SERVICE_KEY"], maxOut: 1400 }),
  run("schoolinfo students", ["node", "scripts/schoolinfo.mjs", "--type", "students", "--year", "2025", "--school-kind", "04", "--limit", "3"], { require: ["SCHOOLINFO_API_KEY"], maxOut: 1800 }),
  run("schoolinfo budget", ["node", "scripts/schoolinfo.mjs", "--type", "budget", "--year", "2025", "--school-kind", "04", "--limit", "2"], { require: ["SCHOOLINFO_API_KEY"], maxOut: 1200 }),
  run("schoolinfo facilities", ["node", "scripts/schoolinfo.mjs", "--type", "facilities", "--year", "2025", "--school-kind", "04", "--limit", "2"], { require: ["SCHOOLINFO_API_KEY"], maxOut: 1200 }),
];

const failed = results.filter((r) => !r.skipped && r.status !== 0);
if (failed.length) process.exit(1);
