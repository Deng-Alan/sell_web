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

function getChannelTone(channel: string) {
  if (channel === "QQ") {
    return "bg-[linear-gradient(155deg,#1e304f_0%,#243e6e_52%,#4d79cf_100%)]";
  }

  return "bg-[linear-gradient(155deg,#173624_0%,#28553d_52%,#4c9a6c_100%)]";
}

export default async function ContactPage() {
  const catalog = await loadPublicCatalog();
  const contacts = selectPrimaryPurchaseContacts(catalog.contacts);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(169,79,29,0.08),transparent_24%),linear-gradient(180deg,#fff8ef_0%,#f5ede1_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">Purchase Contact</p>
            <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)] sm:text-5xl">联系购买</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              当前前台只保留微信和 QQ 两个购买入口。直接扫码联系客服，发送商品名称、截图或链接即可。
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            返回首页
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {contacts.length > 0 ? (
            contacts.map((contact) => {
              const channelLabel = getChannelLabel(contact);

              return (
                <article
                  key={contact.id}
                  id={`contact-${contact.id}`}
                  className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_18px_50px_rgba(16,16,16,0.06)]"
                >
                  <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className={`${getChannelTone(channelLabel)} px-5 py-6 text-white sm:px-6 sm:py-7`}>
                      <p className="text-xs uppercase tracking-[0.32em] text-white/70">购买渠道</p>
                      <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{channelLabel}</h2>
                      <p className="mt-4 max-w-sm text-sm leading-7 text-white/82">{contact.hint}</p>

                      <div className="mt-6 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/60">联系账号</p>
                        <p className="mt-2 break-all text-lg font-semibold">{contact.value}</p>
                        <p className="mt-3 text-sm leading-6 text-white/78">
                          扫码添加后，直接发送商品名称、截图或链接，客服会按商品信息处理购买。
                        </p>
                      </div>
                    </div>

                    <div className="bg-[rgba(255,249,241,0.96)] px-5 py-6 sm:px-6 sm:py-7">
                      <div className="overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white shadow-[0_14px_40px_rgba(16,16,16,0.06)]">
                        {contact.qrImage ? (
                          <img
                            src={contact.qrImage}
                            alt={contact.label}
                            className="aspect-square w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center px-6 text-center text-sm leading-7 text-[var(--muted)]">
                            暂未配置二维码，请直接使用上方账号添加客服。
                          </div>
                        )}
                      </div>

                      <div className="mt-4 rounded-[1.5rem] border border-[rgba(169,79,29,0.18)] bg-[rgba(169,79,29,0.08)] p-4">
                        <p className="text-sm font-semibold text-[var(--accent)]">扫码联系客服购买</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          不再区分“前往”或“咨询”按钮，直接扫码进入人工购买流程。
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-[var(--line)] bg-white px-6 py-12 text-center lg:col-span-2">
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
