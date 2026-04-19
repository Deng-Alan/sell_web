import type { Metadata } from "next";
import Link from "next/link";

import { loadPublicCatalog } from "@/lib/public-catalog";

export const revalidate = 60;

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
              多种联系方式供您选择,我们随时为您提供专业的咨询服务。
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
          {catalog.contacts.length > 0 ? (
            catalog.contacts.map((contact) => {
              const isActionable = !contact.href.startsWith(`#contact-${contact.id}`);
              const ctaLabel = isActionable ? "立即前往" : contact.qrImage ? "扫码添加" : "在线咨询";
              const cardBody = (
                <>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">{contact.label}</p>
                  <p className="mt-3 text-lg font-semibold text-[var(--ink)]">{contact.value}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{contact.hint}</p>
                  {contact.qrImage ? (
                    <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,249,241,0.92)]">
                      <img
                        src={contact.qrImage}
                        alt={contact.label}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                  <span
                    className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                      isActionable
                        ? "border-[var(--line)] text-[var(--ink)] transition group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]"
                        : "border-[rgba(169,79,29,0.18)] bg-[rgba(169,79,29,0.08)] text-[var(--accent)]"
                    }`}
                  >
                    {ctaLabel}
                  </span>
                </>
              );

              if (!isActionable) {
                return (
                  <article
                    key={contact.id}
                    id={`contact-${contact.id}`}
                    className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(16,16,16,0.06)]"
                  >
                    {cardBody}
                  </article>
                );
              }

              return (
                <a
                  key={contact.id}
                  id={`contact-${contact.id}`}
                  href={contact.href}
                  className="group rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(16,16,16,0.06)] transition hover:-translate-y-1 hover:border-[var(--accent)]"
                >
                  {cardBody}
                </a>
              );
            })
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-[var(--line)] bg-white px-6 py-12 text-center md:col-span-2 xl:col-span-4">
              <p className="text-lg font-semibold text-[var(--ink)]">联系方式暂未开放</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                当前无法获取联系方式，请确认后端服务已启动，或稍后刷新页面重试。
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
