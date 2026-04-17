import type { Metadata } from "next";
import Link from "next/link";

import { loadPublicCatalog } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "联系我们 | 商品展示",
  description: "多种联系方式供您选择，随时为您提供专业咨询服务。"
};

export default async function ContactPage() {
  const catalog = await loadPublicCatalog();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(169,79,29,0.08),transparent_24%),linear-gradient(180deg,#fff8ef_0%,#f5ede1_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">Contact Hub</p>
            <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)] sm:text-5xl">联系我们</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              多种联系方式供您选择，我们随时为您提供专业的咨询服务。
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            返回首页
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {catalog.contacts.map((contact) => (
            <a
              key={contact.id}
              href={contact.href}
              className="group rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(16,16,16,0.06)] transition hover:-translate-y-1 hover:border-[var(--accent)]"
            >
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">{contact.label}</p>
              <p className="mt-3 text-lg font-semibold text-[var(--ink)]">{contact.value}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{contact.hint}</p>
              <span className="mt-5 inline-flex rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium text-[var(--ink)] transition group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                立即前往
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
