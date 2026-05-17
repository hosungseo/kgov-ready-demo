#!/usr/bin/env python3
"""Crawl4AI readable-layer adapter for K-Gov public pages.

Strategy: CRAWL4AI_MARKDOWN
Optional dependency: crawl4ai. This script intentionally does not make the
Next.js app depend on Python packages; install the backend only where crawling
is needed:

  python3 -m pip install -U crawl4ai
  crawl4ai-setup
  python3 scripts/crawl-readable.py --url https://www.korea.kr/...
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from datetime import datetime, timezone
from typing import Any


def missing_dependency() -> int:
    print(
        "Missing optional dependency: crawl4ai. Install with `python3 -m pip install -U crawl4ai` "
        "then run `crawl4ai-setup`.",
        file=sys.stderr,
    )
    return 2


def markdown_text(result: Any) -> str:
    md = getattr(result, "markdown", "")
    if isinstance(md, str):
        return md
    # Crawl4AI versions may expose a markdown object with fit/raw fields.
    for attr in ("fit_markdown", "raw_markdown", "markdown"):
        value = getattr(md, attr, "")
        if value:
            return str(value)
    return str(md or "")


async def crawl(url: str, wait_for: str | None = None) -> dict[str, Any]:
    try:
        from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
    except Exception:
        raise RuntimeError("crawl4ai_missing")

    browser_config = BrowserConfig(headless=True)
    run_config_kwargs: dict[str, Any] = {}
    if wait_for:
        run_config_kwargs["wait_for"] = wait_for
    run_config = CrawlerRunConfig(**run_config_kwargs)

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(url=url, config=run_config)

    md = markdown_text(result)
    return {
        "metadata": {
            "source": "crawl4ai",
            "strategy": "CRAWL4AI_MARKDOWN",
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "source_url": url,
            "success": bool(getattr(result, "success", md)),
            "markdown_length": len(md),
        },
        "markdown": md,
        "links": getattr(result, "links", None) or [],
        "media": getattr(result, "media", None) or [],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract clean Markdown from a public page with Crawl4AI.")
    parser.add_argument("--url", required=True, help="Page URL to crawl")
    parser.add_argument("--wait-for", default="", help="Optional CSS selector / wait condition passed to Crawl4AI")
    parser.add_argument("--max-chars", type=int, default=20000, help="Trim markdown for CLI output; 0 means full")
    args = parser.parse_args()

    try:
        payload = asyncio.run(crawl(args.url, args.wait_for or None))
    except RuntimeError as exc:
        if str(exc) == "crawl4ai_missing":
            return missing_dependency()
        raise

    if args.max_chars and len(payload["markdown"]) > args.max_chars:
        payload["markdown_truncated"] = True
        payload["markdown"] = payload["markdown"][: args.max_chars]
    else:
        payload["markdown_truncated"] = False

    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if payload["metadata"]["markdown_length"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
