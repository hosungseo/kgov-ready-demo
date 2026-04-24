import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MINISTRIES, MINISTRY_BY_SLUG } from "@/lib/ministries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";
const SCANNER_URL = "https://agent-ready-check.vercel.app";

export function generateStaticParams() {
  return MINISTRIES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = MINISTRY_BY_SLUG[slug];
  if (!m) return {};
  const ogImage = `${SCANNER_URL}/og?url=${encodeURIComponent(`${SITE_URL}/${m.slug}`)}`;
  return {
    title: m.nameKo,
    description: m.mission,
    alternates: {
      canonical: `/${m.slug}`,
      types: { "text/markdown": `/${m.slug}/index.md` },
      languages: {
        "ko-KR": `/${m.slug}`,
        "en-US": `/en/${m.slug}`,
        "x-default": `/${m.slug}`,
      },
    },
    openGraph: {
      title: `${m.nameKo} (After 시안)`,
      description: m.mission,
      url: `${SITE_URL}/${m.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function MinistryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = MINISTRY_BY_SLUG[slug];
  if (!m) notFound();

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: m.nameKo,
    alternateName: m.nameEn,
    url: `${SITE_URL}/${m.slug}`,
    sameAs: [m.originalUrl],
    address: { "@type": "PostalAddress", addressLocality: m.address, addressCountry: "KR" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: m.contact.phone,
        email: m.contact.email,
        availableLanguage: ["ko", "en"],
      },
    ],
    department: m.services.map((s) => ({
      "@type": "Service",
      name: s.title,
      description: s.desc,
      url: `${SITE_URL}/${m.slug}${s.href}`,
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <div
        className="border-b border-neutral-200"
        style={{ background: `linear-gradient(180deg, ${m.accent}11, transparent 70%)` }}
      >
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between text-sm">
          <Link href="/" className="text-neutral-600 hover:text-gov-navy">
            ← K-Gov Agent-Ready 시안
          </Link>
          <a
            href={m.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-900"
          >
            Before (실제 사이트) ↗
          </a>
        </div>
      </div>

      <section
        className="border-b border-neutral-200"
        style={{ background: `linear-gradient(180deg, ${m.accent}22, transparent)` }}
      >
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div
            className="text-xs uppercase tracking-[0.2em] mb-3 font-semibold"
            style={{ color: m.accent }}
          >
            {m.nameEn}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {m.nameKo}
          </h1>
          <p className="text-lg text-neutral-700 max-w-3xl leading-relaxed">{m.mission}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <a
              href={`/${m.slug}/llms.txt`}
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:border-gov-navy"
            >
              llms.txt
            </a>
            <a
              href={`/${m.slug}/index.md`}
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:border-gov-navy"
            >
              마크다운 본문
            </a>
            <a
              href={`${SCANNER_URL}/?url=${encodeURIComponent(`${SITE_URL}/${m.slug}`)}`}
              className="px-3 py-1.5 bg-gov-navy text-white rounded hover:bg-gov-blue"
            >
              이 페이지 스캔 →
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-xl font-bold mb-5">주요 서비스</h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {m.services.map((s) => (
            <li
              key={s.href}
              className="p-5 border border-neutral-200 rounded-lg bg-white hover:shadow-sm transition"
            >
              <div className="font-semibold mb-2" style={{ color: m.accent }}>
                {s.title}
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
              <div className="mt-3 text-xs text-neutral-400 font-mono">
                {`${SITE_URL.replace(/^https?:\/\//, "")}/${m.slug}${s.href}`}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 border-t border-neutral-200">
        <h2 className="text-xl font-bold mb-5">에이전트가 읽기 좋은 형태</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="p-5 border border-neutral-200 rounded-lg bg-white">
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
              연락처 (구조화)
            </div>
            <div className="text-sm space-y-1 font-mono">
              <div>email: <a href={`mailto:${m.contact.email}`} className="text-gov-blue underline">{m.contact.email}</a></div>
              <div>tel: <a href={`tel:${m.contact.phone}`} className="text-gov-blue underline">{m.contact.phone}</a></div>
              <div>addr: {m.address}</div>
            </div>
          </div>
          <div className="p-5 border border-neutral-200 rounded-lg bg-white">
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
              디스커버리 매니페스트
            </div>
            <ul className="text-sm space-y-1 font-mono">
              <li><a className="text-gov-blue underline" href="/.well-known/mcp.json">/.well-known/mcp.json</a></li>
              <li><a className="text-gov-blue underline" href="/.well-known/agent.json">/.well-known/agent.json</a></li>
              <li><a className="text-gov-blue underline" href="/.well-known/openid-configuration">/.well-known/openid-configuration</a></li>
              <li><a className="text-gov-blue underline" href="/openapi.json">/openapi.json</a></li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mt-12 mx-auto max-w-5xl px-6 pb-12 text-xs text-neutral-500">
        <p>
          본 페이지는 시연용 데모입니다. 정부 공식 입장 아님. 실제 부처 정보는{" "}
          <a href={m.originalUrl} className="underline">
            {m.originalUrl}
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
