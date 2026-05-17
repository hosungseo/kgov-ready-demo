#!/usr/bin/env python3
"""Crawl4AI readable-layer adapter for K-Gov public pages.

Strategy: CRAWL4AI_MARKDOWN
Optional dependency: crawl4ai. This script intentionally does not make the
Next.js app depend on Python packages; install the backend only where crawling
is needed:

  python3.10 -m pip install -U crawl4ai
  python3.10 -m playwright install chromium
  python3.10 scripts/crawl-readable.py --url https://www.korea.kr/...
"""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from datetime import datetime, timezone
from typing import Any


def missing_dependency() -> int:
    print(
        "Missing optional dependency: crawl4ai for Python >=3.10. Install with `python3.10 -m pip install -U crawl4ai` "
        "then run `python3.10 -m playwright install chromium`.",
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


def clean_html_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value or "")).strip()


def first_match(pattern: str, text: str) -> str:
    match = re.search(pattern, text or "", re.S | re.I)
    return clean_html_text(match.group(1)) if match else ""



def generic_public_readable(html: str, markdown: str, url: str) -> str:
    title = (
        first_match(r'<meta property="og:title" content="([^"]*)"', html)
        or first_match(r'<meta name="title" content="([^"]*)"', html)
        or first_match(r'<title>([\s\S]*?)</title>', html)
        or first_markdown_heading(markdown)
    )
    description = (
        first_match(r'<meta name="description" content="([^"]*)"', html)
        or first_match(r'<meta property="og:description" content="([^"]*)"', html)
    )
    date = (
        first_match(r'(20\d{2}[.\-]\d{2}[.\-]\d{2})', html)
        or first_match(r'(20\d{2}[.\-]\d{2}[.\-]\d{2})', markdown)
    )
    body = compact_markdown(markdown)
    lines = []
    if title:
        title = re.sub(r'\s*[|｜-]\s*(대한민국 정책브리핑|국가법령정보센터|국회|정부24).*$','', title).strip()
        lines.append(f"# {title}")
    lines.append("")
    if date:
        lines.append(f"- Date: {date}")
    lines.append(f"- Source: {url}")
    if description:
        lines.append("")
        lines.append("## Summary / extracted description")
        lines.append(description.strip())
    if body:
        lines.append("")
        lines.append("## Readable excerpt")
        lines.append(body[:4000])
    return "\n".join(line for line in lines if line is not None).strip()


def first_markdown_heading(markdown: str) -> str:
    for line in (markdown or "").splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
    return ""


def compact_markdown(markdown: str) -> str:
    drop_phrases = [
        "본문 바로가기", "메인메뉴 바로가기", "이 누리집은 대한민국 공식", "글자크기", "인쇄하기",
        "목록", "페이스북", "트위터", "카카오", "네이버블로그", "공유", "사이트맵",
        "개인정보처리방침", "저작권정책", "이용약관", "Copyright", "COPYRIGHT",
    ]
    lines = []
    seen_blank = False
    for line in (markdown or "").splitlines():
        stripped = line.strip()
        if any(p in stripped for p in drop_phrases):
            continue
        if re.fullmatch(r'[*\-\s\[\]().:/|]+', stripped or ""):
            continue
        if not stripped:
            if not seen_blank:
                lines.append("")
            seen_blank = True
            continue
        seen_blank = False
        lines.append(line)
    text = "\n".join(lines).strip()
    # Start near the first meaningful heading/paragraph when navigation dominates.
    candidates = [idx for idx in [text.find("# "), text.find("## "), text.find("□"), text.find("○")] if idx > 0]
    if candidates and min(candidates) < 2500:
        text = text[min(candidates):]
    return text.strip()

def korea_generic_news_readable(html: str, markdown: str, url: str) -> str:
    title = first_match(r'<meta property="og:title" content="([^"]*)"', html) or first_match(r'<title>([\s\S]*?)</title>', html)
    description = first_match(r'<meta name="description" content="([^"]*)"', html) or first_match(r'<meta property="og:description" content="([^"]*)"', html)
    agency = first_match(r'<meta name="author" content="([^"]*)"', html) or first_match(r'<span class="source">([\s\S]*?)</span>', html)
    date = first_match(r'(20\d{2}\.\d{2}\.\d{2})', markdown) or first_match(r'(20\d{2}-\d{2}-\d{2})', html)
    lines = []
    if title:
        title = title.replace(" | 정책뉴스 | 정책정보 | 대한민국 정책브리핑", "").replace(" | 대한민국 정책브리핑", "").strip()
        lines.append(f"# {title}")
    lines.append("")
    if date:
        lines.append(f"- Date: {date}")
    if agency:
        lines.append(f"- Agency: {agency}")
    lines.append(f"- Source: {url}")
    if description:
        desc = description.replace("- 정책브리핑 | 뉴스 | 정책뉴스", "").strip()
        lines.append("")
        lines.append("## Summary / extracted description")
        lines.append(desc)
    return "\n".join(line for line in lines if line is not None).strip()


def korea_press_readable(html: str, markdown: str, url: str) -> str:
    title = first_match(r'<div class="view_title">[\s\S]*?<h1>([\s\S]*?)</h1>', html) or first_match(r'<meta property="og:title" content="([^"]*)"', html)
    description = first_match(r'<meta name="description" content="([^"]*)"', html) or first_match(r'<meta property="og:description" content="([^"]*)"', html)
    agency = first_match(r'<a class="gotosite"[^>]*>([\s\S]*?)<i class="tooltip">', html)
    date = first_match(r'<span class="date">([\s\S]*?)</span>', html) or first_match(r'(20\d{2}\.\d{2}\.\d{2})', markdown)
    attachments = []
    file_block = re.search(r'<div class="filedown">([\s\S]*?)</div>\s*<!--// E: file Down', html, re.S)
    if file_block:
        for match in re.finditer(r'<a href="([^"]+)">([\s\S]*?)</a>', file_block.group(1), re.S):
            href = match.group(1).replace("&amp;", "&")
            name = clean_html_text(match.group(2))
            if name and name not in {"바로보기", "내려받기"}:
                attachments.append((name, href))
    lines = []
    if title:
        lines.append(f"# {title}")
    if date or agency:
        lines.append("")
        lines.append(f"- Date: {date}" if date else "")
        lines.append(f"- Agency: {agency}" if agency else "")
        lines.append(f"- Source: {url}")
    if description:
        desc = description.replace("- 정책브리핑 | 브리핑룸 | 보도자료", "").strip()
        lines.append("")
        lines.append("## Summary / extracted description")
        lines.append(desc)
    if attachments:
        lines.append("")
        lines.append("## Attachments")
        for name, href in attachments:
            full = href if href.startswith("http") else f"https://www.korea.kr{href}"
            lines.append(f"- [{name}]({full})")
    return "\n".join(line for line in lines if line is not None).strip()


def postprocess_markdown(markdown: str, url: str, profile: str, html: str = "") -> tuple[str, dict[str, Any]]:
    applied = "none"
    text = markdown
    if profile == "auto" and "korea.kr/briefing/pressReleaseView.do" in url:
        profile = "korea-press"
    if profile == "auto" and "korea.kr/news/policyNewsView.do" in url:
        profile = "korea-policy-news"
    if profile == "auto" and any(host in url for host in ["gov.kr", "assembly.go.kr", "likms.assembly.go.kr", "law.go.kr", "moleg.go.kr", "data.go.kr"]):
        profile = "public-generic"
    if profile == "public-generic":
        applied = "public-generic"
        readable = generic_public_readable(html, markdown, url) if html else ""
        if readable:
            text = readable
    if profile == "korea-policy-news":
        applied = "korea-policy-news"
        readable = korea_generic_news_readable(html, markdown, url) if html else ""
        if readable:
            text = readable
    if profile == "korea-press":
        applied = "korea-press"
        readable = korea_press_readable(html, markdown, url) if html else ""
        if readable:
            text = readable
        else:
            markers = ["첨부파일", "공공누리", "이 자료는"]
            start_candidates = [idx for idx in (text.find("# "), text.find("2026."), text.find("2025."), text.find("2024.")) if idx >= 0]
            if start_candidates:
                text = text[min(start_candidates):]
            end_candidates = [text.find(m) for m in markers if text.find(m) > 0]
            if end_candidates:
                text = text[: min(end_candidates)]
            drop_phrases = ["본문듣기", "글자크기 설정", "인쇄하기", "목록"]
            lines = []
            for line in text.splitlines():
                compact = line.strip()
                if not compact:
                    lines.append(line)
                    continue
                if any(phrase in compact for phrase in drop_phrases):
                    continue
                lines.append(line)
            text = "\n".join(lines).strip()
    return text, {"profile": profile, "applied": applied, "original_length": len(markdown), "processed_length": len(text)}


async def crawl(url: str, wait_for: str | None = None, css_selector: str | None = None) -> dict[str, Any]:
    try:
        from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
    except Exception:
        raise RuntimeError("crawl4ai_missing")

    browser_config = BrowserConfig(headless=True)
    run_config_kwargs: dict[str, Any] = {}
    if wait_for:
        run_config_kwargs["wait_for"] = wait_for
    if css_selector:
        run_config_kwargs["css_selector"] = css_selector
    run_config = CrawlerRunConfig(**run_config_kwargs)

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(url=url, config=run_config)

    md = markdown_text(result)
    return {
        "html": getattr(result, "html", "") or getattr(result, "cleaned_html", "") or "",
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
    parser.add_argument("--url", default="", help="Page URL to crawl")
    parser.add_argument("--korea-press-news-id", default="", help="Build a Korea Policy Briefing press-release URL from newsId")
    parser.add_argument("--wait-for", default="", help="Optional CSS selector / wait condition passed to Crawl4AI")
    parser.add_argument("--max-chars", type=int, default=20000, help="Trim markdown for CLI output; 0 means full")
    parser.add_argument("--css-selector", default="", help="Optional Crawl4AI css_selector, e.g. .article_wrap")
    parser.add_argument("--profile", choices=["auto", "korea-press", "korea-policy-news", "public-generic", "none"], default="auto", help="Site-specific readable postprocess profile")
    args = parser.parse_args()
    if args.korea_press_news_id and not args.url:
        args.url = f"https://www.korea.kr/briefing/pressReleaseView.do?newsId={args.korea_press_news_id}"
    if not args.url:
        parser.error("--url or --korea-press-news-id is required")

    try:
        payload = asyncio.run(crawl(args.url, args.wait_for or None, args.css_selector or None))
    except RuntimeError as exc:
        if str(exc) == "crawl4ai_missing":
            return missing_dependency()
        raise

    processed, postprocess = postprocess_markdown(payload["markdown"], args.url, args.profile, payload.get("html", ""))
    payload["markdown_raw_length"] = len(payload["markdown"])
    payload["markdown"] = processed
    payload["postprocess"] = postprocess

    if args.max_chars and len(payload["markdown"]) > args.max_chars:
        payload["markdown_truncated"] = True
        payload["markdown"] = payload["markdown"][: args.max_chars]
    else:
        payload["markdown_truncated"] = False
    payload["metadata"]["markdown_length"] = len(payload["markdown"])

    payload.pop("html", None)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if payload["metadata"]["markdown_length"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
