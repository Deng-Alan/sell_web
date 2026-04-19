import type { Metadata } from "next";
import Link from "next/link";

import { loadPublicCatalog, selectPrimaryPurchaseContacts, type ShowcaseContactCard } from "@/lib/public-catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "联系购买 | 商品展示",
  description: "仅保留微信和 QQ 购买入口，直接扫码联系客服购买。"
};

function getChannelLabel(contact: ShowcaseContactCard) {
  const normalized = `${contact.type} ${contact.label}`.toLowerCase();
  return normalized.includes("qq") ? "QQ" : "微信";
}

function getChannelHint(channel: string) {
  return channel === "QQ" ? "QQ 扫码购买" : "微信扫码购买";
}

export default async function ContactPage() {
  const catalog = await loadPublicCatalog();
  const contacts = selectPrimaryPurchaseContacts(catalog.contacts);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#f4ecdf_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">联系购买</p>
            <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)] sm:text-5xl">扫码联系客服购买</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              当前前台只保留微信和 QQ 两个购买入口。扫码后直接发送商品名称、截图或页面链接即可。
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            返回首页
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {contacts.length > 0 ? (
            contacts.map((contact) => {
              const channelLabel = getChannelLabel(contact);

              return (
                <article
                  key={contact.id}
                  id={`contact-${contact.id}`}
                  className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(16,16,16,0.06)] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">{getChannelHint(channelLabel)}</p>
                      <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">{channelLabel}</h2>
                    </div>
                    <span className="rounded-full border border-[rgba(16,16,16,0.08)] bg-[rgba(255,248,239,0.82)] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                      人工购买
                    </span>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,248,239,0.72)] p-4">
                    {contact.qrImage ? (
                      <img
                        src={contact.qrImage}
                        alt={contact.label}
                        className="aspect-square w-full rounded-[1.2rem] border border-[rgba(16,16,16,0.06)] bg-white object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-[1.2rem] border border-dashed border-[var(--line)] bg-white px-6 text-center text-sm leading-7 text-[var(--muted)]">
                        暂未配置二维码，请直接使用下方账号联系。
                      </div>
                    )}
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-[rgba(16,16,16,0.06)] bg-[rgba(255,250,244,0.88)] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">联系账号</p>
                    <p className="mt-2 break-all text-lg font-semibold text-[var(--ink)]">{contact.value}</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                      扫码添加后，直接发送商品名称、截图或链接。客服确认信息后会继续跟进购买流程。
                    </p>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-[var(--line)] bg-white px-6 py-12 text-center md:col-span-2">
              <p className="text-lg font-semibold text-[var(--ink)]">购买入口暂未开放</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                当前无法获取微信或 QQ 购买渠道，请确认后台联系人配置和服务状态后重试。
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
