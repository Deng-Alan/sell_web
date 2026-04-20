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
  return channel === "QQ" ? "在线咨询" : "在线咨询";
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
                  <div>
                    <p className="text-xl font-semibold text-[var(--ink)]">{contact.label}</p>
                    <p className="mt-4 break-all text-[2rem] font-semibold leading-none text-[var(--ink)] sm:text-[2.15rem]">
                      {contact.value}
                    </p>
                    <p className="mt-4 text-lg text-[var(--ink)]">{getChannelHint(channelLabel)}</p>
                  </div>

                  <div className="mt-5 rounded-[1.75rem] border border-[rgba(16,16,16,0.06)] bg-[rgba(255,250,244,0.92)] p-5">
                    {contact.qrImage ? (
                      <div className="mx-auto w-full max-w-[20rem] rounded-[1.4rem] border border-[rgba(16,16,16,0.06)] bg-white p-3">
                        <img
                          src={contact.qrImage}
                          alt={contact.label}
                          className="block h-auto w-full rounded-[1rem] object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="mx-auto flex min-h-[18rem] w-full max-w-[20rem] items-center justify-center rounded-[1.4rem] border border-dashed border-[var(--line)] bg-white px-6 text-center text-sm leading-7 text-[var(--muted)]">
                        暂未配置二维码，请直接使用下方账号联系。
                      </div>
                    )}

                    <div className="mt-5">
                      <span className="inline-flex rounded-full border border-[rgba(16,16,16,0.08)] bg-white px-4 py-2 text-base font-medium text-[var(--ink)]">
                        扫码添加
                      </span>
                    </div>
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
