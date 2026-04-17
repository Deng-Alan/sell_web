import type { Metadata } from "next";
import Link from "next/link";

import { formatCurrency, loadPublicCatalog, type PublicCatalogQuery, type ShowcaseCategoryOption, type ShowcaseProductCard } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "商品展示 | 精选商品目录",
  description: "浏览精选商品,按分类筛选并快速咨询购买。"
};

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function pickQueryValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeQuery(searchParams?: Record<string, string | string[] | undefined>): PublicCatalogQuery {
  return {
    keyword: pickQueryValue(searchParams?.q).trim(),
    categoryId: pickQueryValue(searchParams?.category).trim(),
    stock: pickQueryValue(searchParams?.stock).trim(),
    page: pickQueryValue(searchParams?.page).trim(),
    pageSize: pickQueryValue(searchParams?.pageSize).trim() || "9"
  };
}

function buildCatalogHref(query: PublicCatalogQuery, nextPage: number) {
  const params = new URLSearchParams();
  if (query.keyword) {
    params.set("q", query.keyword);
  }
  if (query.categoryId && query.categoryId !== "all") {
    params.set("category", query.categoryId);
  }
  if (query.stock && query.stock !== "all") {
    params.set("stock", query.stock);
  }
  params.set("page", String(nextPage));
  params.set("pageSize", query.pageSize || "9");
  return `/?${params.toString()}`;
}

function findCategoryLabel(categories: ShowcaseCategoryOption[], categoryId: string) {
  if (!categoryId || categoryId === "all") {
    return "全部分类";
  }

  return categories.find((category) => category.value === categoryId)?.label ?? "全部分类";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = normalizeQuery(resolvedSearchParams);
  const catalog = await loadPublicCatalog(query);
  const selectedCategoryLabel = findCategoryLabel(catalog.categories, query.categoryId ?? "");

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,#1d1511,#211914_45%,#3d2819)] text-white shadow-[0_28px_80px_rgba(16,16,16,0.18)]">
          <div className="grid gap-8 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 lg:py-12">
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

              <div className="flex flex-wrap gap-3">
                <Link
                  href="#catalog"
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#8f4318]"
                >
                  查看商品
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/8"
                >
                  咨询入口
                </Link>
              </div>
            </div>

            <div className="grid gap-3 self-start rounded-[1.75rem] border border-white/10 bg-white/6 p-4 backdrop-blur sm:p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                <MetricTile label="总商品" value={catalog.stats.totalProducts.toString()} />
                <MetricTile label="可见" value={catalog.stats.visibleProducts.toString()} />
                <MetricTile label="推荐" value={catalog.stats.featuredCount.toString()} />
                <MetricTile label="售罄" value={catalog.stats.soldOutCount.toString()} />
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <p className="text-sm text-white/65">库存总量</p>
                <p className="mt-2 text-4xl font-semibold text-white">{catalog.stats.totalStock}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  实时更新的商品库存数据，确保信息准确可靠。
                </p>
              </div>
            </div>
          </div>
        </div>

        <section
          id="catalog"
          className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,249,241,0.9)] p-4 shadow-[0_18px_60px_rgba(16,16,16,0.08)] sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--accent)]">Filter</p>
              <h2 className="text-2xl font-semibold text-[var(--ink)]">筛选商品</h2>
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                使用分类、关键词和库存条件快速筛选，找到您需要的商品。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {catalog.categories.map((category) => (
                <span
                  key={category.value}
                  className={`rounded-full border px-3 py-2 text-xs font-medium ${
                    category.value === query.categoryId || (!query.categoryId && category.value === "all")
                      ? "border-[var(--accent)] bg-[rgba(169,79,29,0.08)] text-[var(--accent)]"
                      : "border-[var(--line)] bg-white text-[var(--ink)]/70"
                  }`}
                >
                  {category.label}
                </span>
              ))}
            </div>
          </div>

          <form className="mt-5 grid gap-3 rounded-3xl border border-[var(--line)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto] lg:p-5">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="pageSize" value={query.pageSize || "9"} />
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
              关键词
              <input
                name="q"
                defaultValue={query.keyword}
                placeholder="搜索商品名、SKU、说明"
                className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
              分类
              <select
                name="category"
                defaultValue={query.categoryId || "all"}
                className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
              >
                <option value="all">全部分类</option>
                {catalog.categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
              库存
              <select
                name="stock"
                defaultValue={query.stock || "all"}
                className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
              >
                <option value="all">全部库存</option>
                <option value="in-stock">有库存</option>
                <option value="low-stock">低库存</option>
                <option value="sold-out">售罄</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-[var(--ink)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1d1d1d]"
              >
                应用筛选
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
            <p>
              当前分类：<span className="font-medium text-[var(--ink)]">{selectedCategoryLabel}</span>
            </p>
            <p>当前结果：{catalog.stats.visibleProducts} 条</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {catalog.products.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[var(--line)] bg-white px-5 py-10 text-center text-sm text-[var(--muted)]">
              当前筛选条件下暂无商品，请尝试调整筛选条件。
            </div>
          ) : null}

          {catalog.pagination.totalPages > 1 ? (
            <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-white px-5 py-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                当前第 <span className="font-medium text-[var(--ink)]">{catalog.pagination.page}</span> /
                {catalog.pagination.totalPages} 页，共 {catalog.pagination.total} 条结果
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildCatalogHref(query, 1)}
                  className={`rounded-full border px-4 py-2 ${catalog.pagination.page <= 1 ? "pointer-events-none border-[var(--line)] text-[var(--muted)]/50" : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
                >
                  首页
                </Link>
                <Link
                  href={buildCatalogHref(query, Math.max(1, catalog.pagination.page - 1))}
                  className={`rounded-full border px-4 py-2 ${catalog.pagination.page <= 1 ? "pointer-events-none border-[var(--line)] text-[var(--muted)]/50" : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
                >
                  上一页
                </Link>
                <Link
                  href={buildCatalogHref(query, Math.min(catalog.pagination.totalPages, catalog.pagination.page + 1))}
                  className={`rounded-full border px-4 py-2 ${catalog.pagination.page >= catalog.pagination.totalPages ? "pointer-events-none border-[var(--line)] text-[var(--muted)]/50" : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
                >
                  下一页
                </Link>
                <Link
                  href={buildCatalogHref(query, catalog.pagination.totalPages)}
                  className={`rounded-full border px-4 py-2 ${catalog.pagination.page >= catalog.pagination.totalPages ? "pointer-events-none border-[var(--line)] text-[var(--muted)]/50" : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
                >
                  末页
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/6 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.25em] text-white/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ProductCard({ product }: { product: ShowcaseProductCard }) {
  const hasOriginalPrice = product.originalPrice !== null && product.originalPrice > product.price;

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[0_12px_40px_rgba(16,16,16,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(16,16,16,0.1)]">
      <div
        className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-5 text-white"
        style={{ backgroundImage: product.coverTone }}
      >
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[rgba(244,205,189,0.92)]">{product.sku}</p>
          <h3 className="text-xl font-semibold text-white">{product.name}</h3>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-semibold text-white">
          {product.badge}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-full bg-[rgba(169,79,29,0.1)] px-3 py-1 text-[var(--accent)]">{product.categoryName}</span>
          <span className="rounded-full bg-[rgba(49,91,74,0.1)] px-3 py-1 text-[#315b4a]">
            {product.stock > 0 ? "可购买" : "已售罄"}
          </span>
          {product.featured ? <span className="rounded-full bg-[rgba(29,21,17,0.06)] px-3 py-1 text-[var(--ink)]/70">推荐位</span> : null}
        </div>

        <p className="min-h-[3.5rem] text-sm leading-6 text-[var(--muted)]">{product.summary}</p>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#fbf7ee] p-4">
          <InfoPill label="价格" value={formatCurrency(product.price)} accent="text-[var(--accent)]" />
          <InfoPill
            label="库存"
            value={product.stock > 0 ? `${product.stock} 件` : "售罄"}
            accent={product.stock > 0 ? "text-[#315b4a]" : "text-[var(--ink)]"}
          />
        </div>

        {hasOriginalPrice ? (
          <div className="text-xs text-[var(--muted)]">
            原价 <span className="line-through">{formatCurrency(product.originalPrice ?? 0)}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium text-[var(--ink)]/60">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-xs leading-5 text-[var(--muted)]/85">
            <p>更新于 {product.updatedAt}</p>
            <p>支持在线咨询</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              href={`/products/${product.id}`}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-center text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              详情
            </Link>
            <a
              href={product.contactHref}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-[#8f4318]"
            >
              咨询
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoPill({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
