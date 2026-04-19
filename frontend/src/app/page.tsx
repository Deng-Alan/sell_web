import type { Metadata } from "next";

import { HomeCatalogClient } from "@/components/common/home-catalog-client";
import { loadPublicCatalogSnapshot } from "@/lib/public-catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "商品展示 | 精选商品目录",
  description: "浏览精选商品,按分类筛选并快速咨询购买。"
};

export default async function HomePage() {
  const snapshot = await loadPublicCatalogSnapshot();

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,#1d1511,#211914_45%,#3d2819)] text-white shadow-[0_28px_80px_rgba(16,16,16,0.18)]">
          <div className="grid gap-8 px-5 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-[rgba(241,201,182,0.9)]">
                <span>Product Catalog</span>
                <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 tracking-[0.2em] text-white/75">
                  精选商品
                </span>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-6xl">
                  按分类浏览商品，快速找到心仪产品
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/78 sm:text-base lg:text-lg">
                  精选优质商品，支持分类筛选和关键词搜索，
                  提供详细的商品信息和便捷的咨询渠道，让您轻松选购。
                </p>
              </div>

            </div>
          </div>
        </div>

        <HomeCatalogClient snapshot={snapshot} />
      </section>
    </main>
  );
}
