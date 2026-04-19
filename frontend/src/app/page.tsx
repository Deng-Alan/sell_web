import type { Metadata } from "next";

import { HomeCatalogClient } from "@/components/common/home-catalog-client";
import { loadPublicCatalogSnapshot, selectPrimaryPurchaseContacts } from "@/lib/public-catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "商品展示 | 精选商品目录",
  description: "浏览精选商品,按分类筛选并快速咨询购买。"
};

export default async function HomePage() {
  const snapshot = await loadPublicCatalogSnapshot();
  const primaryContacts = selectPrimaryPurchaseContacts(snapshot.contacts);
  const heroMetrics = [
    { label: "在售商品", value: `${snapshot.products.length} 款` },
    { label: "商品分类", value: `${snapshot.categories.length} 类` },
    { label: "购买入口", value: `${primaryContacts.length || 1} 个` }
  ];

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_24px_70px_rgba(16,16,16,0.08)] sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">精选商品目录</span>
                <span className="rounded-full border border-[rgba(16,16,16,0.08)] bg-[rgba(255,248,239,0.84)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                  人工购买
                </span>
              </div>
              <div className="space-y-4">
                <h1
                  className="max-w-3xl text-[2.45rem] font-semibold leading-[1.12] tracking-[-0.03em] text-[var(--ink)] sm:text-[3rem] lg:text-[3.2rem]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <span className="block">按分类浏览商品</span>
                  <span className="mt-1 block text-[var(--accent)]">快速找到心仪产品</span>
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  精选优质商品，支持关键词搜索和详情查看。前台聚焦商品展示，购买统一由客服承接，路径更直接。
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {heroMetrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,248,239,0.72)] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <HomeCatalogClient snapshot={snapshot} />
      </section>
    </main>
  );
}
