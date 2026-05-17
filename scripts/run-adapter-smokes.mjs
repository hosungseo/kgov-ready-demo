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
  run("gazette metadata", ["node", "scripts/gazette-search.mjs", "--from", "2026-05-01", "--to", "2026-05-17", "--keyword", "고시", "--page-size", "3"], { require: ["GAZETTE_API_KEY"] }),
  run("assembly bill", ["node", "scripts/assembly-bill.mjs", "search", "--endpoint", "ALLBILLV2", "--eraco", "제22대", "--limit", "3"], { require: ["ASSEMBLY_API_KEY"] }),
  run("moleg law", ["node", "scripts/moleg-law.mjs", "search", "--query", "정부조직법", "--limit", "3"], { require: ["MOLEG_OC"] }),
];

const failed = results.filter((r) => !r.skipped && r.status !== 0);
if (failed.length) process.exit(1);
