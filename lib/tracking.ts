import { Redis } from "@upstash/redis";
import { MINISTRY_BY_SLUG } from "./ministries";

/**
 * Agent UA patterns. Name is the canonical label shown in the dashboard.
 * Patterns match case-insensitively anywhere in the User-Agent string.
 */
export const AGENT_PATTERNS: { name: string; re: RegExp; kind: "ai" | "search" | "seo" | "scanner" | "misc" }[] = [
  // AI crawlers / training bots
  { name: "GPTBot", re: /GPTBot/i, kind: "ai" },
  { name: "ChatGPT-User", re: /ChatGPT-User/i, kind: "ai" },
  { name: "OAI-SearchBot", re: /OAI-SearchBot/i, kind: "ai" },
  { name: "ClaudeBot", re: /ClaudeBot/i, kind: "ai" },
  { name: "Claude-User", re: /Claude-User/i, kind: "ai" },
  { name: "Claude-Web", re: /Claude-Web/i, kind: "ai" },
  { name: "anthropic-ai", re: /anthropic-ai/i, kind: "ai" },
  { name: "CCBot", re: /CCBot/i, kind: "ai" },
  { name: "PerplexityBot", re: /PerplexityBot/i, kind: "ai" },
  { name: "Perplexity-User", re: /Perplexity-User/i, kind: "ai" },
  { name: "Google-Extended", re: /Google-Extended/i, kind: "ai" },
  { name: "Applebot-Extended", re: /Applebot-Extended/i, kind: "ai" },
  { name: "Bytespider", re: /Bytespider/i, kind: "ai" },
  { name: "Amazonbot", re: /Amazonbot/i, kind: "ai" },
  { name: "Meta-ExternalAgent", re: /Meta-ExternalAgent/i, kind: "ai" },
  { name: "DuckAssistBot", re: /DuckAssistBot/i, kind: "ai" },
  { name: "cohere-ai", re: /cohere-ai/i, kind: "ai" },
  { name: "FirecrawlAgent", re: /FirecrawlAgent|firecrawl/i, kind: "ai" },
  { name: "Diffbot", re: /Diffbot/i, kind: "ai" },

  // Search engines
  { name: "Googlebot", re: /Googlebot(?!-Image)/i, kind: "search" },
  { name: "Bingbot", re: /Bingbot|BingPreview/i, kind: "search" },
  { name: "Applebot", re: /\bApplebot\b(?!-Extended)/i, kind: "search" },
  { name: "DuckDuckBot", re: /DuckDuckBot/i, kind: "search" },
  { name: "YandexBot", re: /Yandex/i, kind: "search" },
  { name: "Baiduspider", re: /Baiduspider/i, kind: "search" },

  // SEO/scanners
  { name: "AhrefsBot", re: /AhrefsBot/i, kind: "seo" },
  { name: "SemrushBot", re: /SemrushBot/i, kind: "seo" },
  { name: "MJ12bot", re: /MJ12bot/i, kind: "seo" },
  { name: "DotBot", re: /DotBot/i, kind: "seo" },

  // Agent-ready-check self
  { name: "AgentReadyCheck", re: /AgentReadyCheck/i, kind: "scanner" },

  // Generic catch-alls
  { name: "other-bot", re: /\b(bot|crawler|spider)\b/i, kind: "misc" },
];

export function detectAgent(userAgent: string): { name: string; kind: string } | null {
  if (!userAgent) return null;
  for (const p of AGENT_PATTERNS) {
    if (p.re.test(userAgent)) return { name: p.name, kind: p.kind };
  }
  return null;
}

export function extractTargetSlug(pathname: string): string | null {
  const m = pathname.match(/^\/([a-z]+)(\/|$)/);
  if (!m) return null;
  return MINISTRY_BY_SLUG[m[1]] ? m[1] : null;
}

export type VisitEntry = {
  ts: number;
  ua: string;
  agent: string;
  kind: string;
  path: string;
  slug: string | null;
  accept: string;
  ref: string;
  country?: string;
};

let _redis: Redis | null | undefined;
export function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _redis = null;
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

export function isTrackingConfigured(): boolean {
  return getRedis() !== null;
}

const VISITS_KEY = "visits";
const VISITS_CAP = 500;
const STATS_AGENT = "stats:agent";
const STATS_KIND = "stats:kind";
const STATS_SLUG = "stats:slug";
const STATS_PATH = "stats:path";
const STATS_ACCEPT = "stats:accept";
const STATS_DAY = "stats:day";
const TOTAL_KEY = "stats:total";

export async function logVisit(entry: VisitEntry): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const day = new Date(entry.ts).toISOString().slice(0, 10);
  try {
    const pipe = redis.pipeline();
    pipe.lpush(VISITS_KEY, JSON.stringify(entry));
    pipe.ltrim(VISITS_KEY, 0, VISITS_CAP - 1);
    pipe.hincrby(STATS_AGENT, entry.agent, 1);
    pipe.hincrby(STATS_KIND, entry.kind, 1);
    if (entry.slug) pipe.hincrby(STATS_SLUG, entry.slug, 1);
    pipe.hincrby(STATS_PATH, entry.path.slice(0, 80), 1);
    const acceptBucket = entry.accept.includes("text/markdown")
      ? "markdown"
      : entry.accept.includes("application/json")
        ? "json"
        : entry.accept.includes("text/html")
          ? "html"
          : "other";
    pipe.hincrby(STATS_ACCEPT, acceptBucket, 1);
    pipe.hincrby(STATS_DAY, day, 1);
    pipe.incr(TOTAL_KEY);
    await pipe.exec();
  } catch {
    // swallow — never break the request on logging failure
  }
}

export async function getDashboardData(): Promise<{
  total: number;
  visits: VisitEntry[];
  byAgent: Array<{ name: string; count: number }>;
  byKind: Array<{ name: string; count: number }>;
  bySlug: Array<{ name: string; count: number }>;
  byPath: Array<{ name: string; count: number }>;
  byAccept: Array<{ name: string; count: number }>;
  byDay: Array<{ name: string; count: number }>;
} | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const [total, rawVisits, agent, kind, slug, path, accept, day] = await Promise.all([
      redis.get<number>(TOTAL_KEY),
      redis.lrange<string>(VISITS_KEY, 0, 99),
      redis.hgetall<Record<string, string>>(STATS_AGENT),
      redis.hgetall<Record<string, string>>(STATS_KIND),
      redis.hgetall<Record<string, string>>(STATS_SLUG),
      redis.hgetall<Record<string, string>>(STATS_PATH),
      redis.hgetall<Record<string, string>>(STATS_ACCEPT),
      redis.hgetall<Record<string, string>>(STATS_DAY),
    ]);
    const parse = (obj: Record<string, string> | null | undefined) =>
      Object.entries(obj ?? {})
        .map(([name, count]) => ({ name, count: Number(count) || 0 }))
        .sort((a, b) => b.count - a.count);
    const visits: VisitEntry[] = (rawVisits ?? []).map((s) => {
      try {
        return typeof s === "string" ? JSON.parse(s) : s;
      } catch {
        return null;
      }
    }).filter(Boolean) as VisitEntry[];
    return {
      total: Number(total ?? 0),
      visits,
      byAgent: parse(agent),
      byKind: parse(kind),
      bySlug: parse(slug),
      byPath: parse(path),
      byAccept: parse(accept),
      byDay: parse(day).sort((a, b) => a.name.localeCompare(b.name)),
    };
  } catch {
    return null;
  }
}
