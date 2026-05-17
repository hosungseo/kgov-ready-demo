#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function arg(name, fallback = "") {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function hasFlag(name) {
  return process.argv.includes("--" + name);
}
function short(s, n = 160) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
function shellQuote(s) {
  const v = String(s || "");
  return /^[A-Za-z0-9_./:-]+$/.test(v) ? v : "\"" + v.replace(/"/g, "\\\"") + "\"";
}
function uniq(values) {
  return [...new Set(values.filter(Boolean).map(v => String(v).trim()).filter(Boolean))];
}
async function fetchJson(url) {
  const r = await fetch(url, { headers: { "user-agent": "kgov-ready-demo repo bridge" } });
  if (!r.ok) throw new Error(url + " returned " + r.status);
  return r.json();
}
function seedFromPacket(packet) {
  const signals = uniq(packet.signals || []);
  const terms = uniq(packet.terms || []);
  const topItem = Array.isArray(packet.items) ? packet.items[0] : undefined;
  const ministry = packet.ministry || "";
  const topic = signals.slice(0, 3).join(" ") || packet.issue_id || topItem?.query || "정책 이슈";
  const issueSignal = signals.find(s => s !== ministry && String(s).length >= 4) || signals.find(s => s !== ministry) || topic;
  const policyQuery = issueSignal || ministry || topic;
  const lawQuery = uniq([issueSignal, signals.find(s => s !== issueSignal && s !== ministry)]).slice(0, 2).join(" ") || ministry || topic;
  const scheduleKeyword = signals[0] || terms[0] || topic;
  const gov24Keyword = signals[1] || terms.find(t => !ministry || t !== ministry) || topic;
  const workflowCommand = [
    "node", "scripts/issue-workflow.mjs",
    "--topic", shellQuote(topic),
    "--policy-query", shellQuote(policyQuery),
    "--law-query", shellQuote(lawQuery),
    "--schedule-keyword", shellQuote(scheduleKeyword),
    "--gov24-keyword", shellQuote(gov24Keyword),
  ].join(" ");
  return {
    issue_id: packet.issue_id || "",
    upstream_repo: "hosungseo/question-forecast",
    upstream_api: arg("url", "https://question-forecast.vercel.app/api/issues"),
    ministry,
    priority: Number(packet.priority || 0),
    article_count: Number(packet.count || packet.items?.length || 0),
    topic,
    policy_query: policyQuery,
    law_query: lawQuery,
    schedule_keyword: scheduleKeyword,
    gov24_keyword: gov24Keyword,
    signals: signals.slice(0, 10),
    terms: terms.slice(0, 10),
    lead_item: topItem ? {
      title: short(topItem.title),
      query: topItem.query || "",
      date: topItem.pub_date || "",
      url: topItem.originallink || topItem.link || "",
      relevance_score: topItem.relevance_score ?? "",
    } : null,
    workflow_command: workflowCommand,
  };
}
function renderMd(result) {
  const lines = [
    "# Question Forecast Issue Seeds",
    "",
    "- Upstream: `hosungseo/question-forecast`",
    "- API: `" + result.upstream_api + "`",
    "- Generated: " + result.generated_at,
    "- Upstream generated: " + (result.upstream_generated_at || "n/a"),
    "- Seeds: " + result.seeds.length,
    "",
  ];
  for (const seed of result.seeds) {
    lines.push("## " + seed.topic);
    lines.push("- Issue id: `" + seed.issue_id + "`");
    lines.push("- Ministry: " + (seed.ministry || "n/a"));
    lines.push("- Priority: " + seed.priority + ", articles: " + seed.article_count);
    lines.push("- Signals: " + (seed.signals.join(", ") || "n/a"));
    if (seed.lead_item) {
      lines.push("- Lead: " + seed.lead_item.title);
      if (seed.lead_item.url) lines.push("- Lead URL: " + seed.lead_item.url);
    }
    lines.push("- Workflow command: `" + seed.workflow_command + "`");
    lines.push("");
  }
  lines.push("## Use", "");
  lines.push("Run one workflow command to turn a forecast issue into a Kgov casefile.");
  lines.push("Use `--run-top` only when you want this bridge to execute the top seed immediately.");
  return lines.join("\n");
}
function runTop(seed) {
  const args = [
    "scripts/issue-workflow.mjs",
    "--topic", seed.topic,
    "--policy-query", seed.policy_query,
    "--law-query", seed.law_query,
    "--schedule-keyword", seed.schedule_keyword,
    "--gov24-keyword", seed.gov24_keyword,
  ];
  const r = spawnSync("node", args, { encoding: "utf8", env: process.env, maxBuffer: 64 * 1024 * 1024 });
  return { command: ["node", ...args].map(shellQuote).join(" "), status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

const limit = Number(arg("limit", "5"));
const apiUrl = arg("url", "https://question-forecast.vercel.app/api/issues");
const data = await fetchJson(apiUrl);
const seeds = (data.packets || []).map(seedFromPacket).sort((a, b) => b.priority - a.priority).slice(0, limit);
const result = {
  source: "question-forecast-seeds",
  upstream_repo: "hosungseo/question-forecast",
  upstream_api: apiUrl,
  upstream_generated_at: data.generated_at || "",
  generated_at: new Date().toISOString(),
  count: seeds.length,
  seeds,
};
if (hasFlag("run-top") && seeds[0]) {
  result.run = runTop(seeds[0]);
  if (result.run.status !== 0) process.exitCode = result.run.status || 1;
}
if (arg("format", "md") === "json") console.log(JSON.stringify(result, null, 2));
else {
  console.log(renderMd(result));
  if (result.run) {
    console.log("\n## Run top result\n");
    console.log("- Command: `" + result.run.command + "`");
    console.log("- Status: " + result.run.status);
    if (result.run.stdout) console.log("\n```text\n" + result.run.stdout.slice(0, 4000) + "\n```");
    if (result.run.stderr) console.log("\n```text\n" + result.run.stderr.slice(0, 1600) + "\n```");
  }
}
