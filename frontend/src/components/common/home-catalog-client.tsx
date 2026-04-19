"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  applyCatalogFilters,
  formatCurrency,
  type PublicCatalogQuery,
  type PublicCatalogSnapshot,
  type ShowcaseProductCard
} from "@/lib/public-catalog";

type HomeCatalogClientProps = {
  snapshot: PublicCatalogSnapshot;
};

type CatalogClientQuery = {
  keyword: string;
  categoryId: string;
  stock: string;
  page: number;
  pageSize: number;
};

const DEFAULT_QUERY: CatalogClientQuery = {
  keyword: "",
  categoryId: "",
  stock: "",
  page: 1,
  pageSize: 9
};

function pickFirstValue(value: string | null) {
  return value?.trim() ?? "";
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseQueryFromLocation() {
  if (typeof window === "undefined") {
    return DEFAULT_QUERY;
  }

  const searchParams = new URLSearchParams(window.location.search);
  return {
    keyword: pickFirstValue(searchParams.get("q")),
    categoryId: pickFirstValue(searchParams.get("category")),
    stock: pickFirstValue(searchParams.get("stock")),
    page: parsePositiveInt(searchParams.get("page"), DEFAULT_QUERY.page),
    pageSize: parsePositiveInt(searchParams.get("pageSize"), DEFAULT_QUERY.pageSize)
  };
}

function toPublicCatalogQuery(query: CatalogClientQuery): PublicCatalogQuery {
  return {
    keyword: query.keyword,
    categoryId: query.categoryId,
    stock: query.stock,
    page: String(query.page),
    pageSize: String(query.pageSize)
  };
}

function buildCatalogHref(query: CatalogClientQuery) {
  const searchParams = new URLSearchParams();
  if (query.keyword) {
    searchParams.set("q", query.keyword);
  }
  if (query.categoryId && query.categoryId !== "all") {
    searchParams.set("category", query.categoryId);
  }
  if (query.stock && query.stock !== "all") {
    searchParams.set("stock", query.stock);
  }
  if (query.page > 1) {
    searchParams.set("page", String(query.page));
  }
  if (query.pageSize !== DEFAULT_QUERY.pageSize) {
    searchParams.set("pageSize", String(query.pageSize));
  }

  const href = searchParams.toString();
  return href ? `/?${href}` : "/";
}

function pushCatalogHistory(query: CatalogClientQuery) {
  if (typeof window === "undefined") {
    return;
  }

  const nextHref = buildCatalogHref(query);
  window.history.pushState({ query }, "", nextHref);
}

export function HomeCatalogClient({ snapshot }: HomeCatalogClientProps) {
  const [query, setQuery] = useState<CatalogClientQuery>(DEFAULT_QUERY);
  const [keywordDraft, setKeywordDraft] = useState(DEFAULT_QUERY.keyword);

  useEffect(() => {
    const syncFromLocation = () => {
      const nextQuery = parseQueryFromLocation();
      setQuery(nextQuery);
      setKeywordDraft(nextQuery.keyword);
    };

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  const filteredProducts = useMemo(
    () => applyCatalogFilters(snapshot.products, toPublicCatalogQuery(query)),
    [query, snapshot.products]
  );

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / Math.max(1, query.pageSize)));
  const currentPage = Math.min(query.page, totalPages);
  const pageSize = Math.max(1, query.pageSize);
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const visibleProducts = filteredProducts.slice(pageStart, pageEnd);
  const totalStock = filteredProducts.reduce((sum, product) => sum + product.stock, 0);
  const isServiceUnavailable = snapshot.source === "fallback";

  function updateQuery(nextQuery: CatalogClientQuery) {
    const normalizedQuery = {
      ...nextQuery,
      page: Math.max(1, nextQuery.page),
      pageSize: Math.max(1, nextQuery.pageSize)
    };
    setQuery(normalizedQuery);
    pushCatalogHistory(normalizedQuery);
  }

  function goToPage(nextPage: number) {
    updateQuery({
      ...query,
      page: nextPage
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      ...query,
      keyword: keywordDraft.trim(),
      page: 1
    });
  }

  return (
    <section
      id="catalog"
      className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,249,241,0.9)] p-4 shadow-[0_18px_60px_rgba(16,16,16,0.08)] sm:p-6 lg:p-8"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--accent)]">商品搜索</p>
          <h2 className="text-2xl font-semibold text-[var(--ink)]">搜索商品</h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">输入关键词，快速找到想看的商品。</p>
        </div>
      </div>

      <form className="mt-5 grid gap-3 rounded-3xl border border-[var(--line)] bg-white p-4 lg:grid-cols-[1fr_auto] lg:p-5" onSubmit={handleSubmit}>
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="pageSize" value={query.pageSize} />
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
          关键词
          <input
            name="q"
            value={keywordDraft}
            onChange={(event) => setKeywordDraft(event.target.value)}
            placeholder="搜索商品名、SKU、说明"
            className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-2xl bg-[var(--ink)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1d1d1d]"
          >
            搜索
          </button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <p>当前结果：{totalProducts} 条，总库存：{totalStock} 件</p>
        {isServiceUnavailable ? (
          <span className="rounded-full border border-[rgba(169,79,29,0.18)] bg-[rgba(169,79,29,0.08)] px-3 py-1 text-[var(--accent)]">
            当前无法获取商品数据
          </span>
        ) : null}
      </div>

      {visibleProducts.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-[var(--line)] bg-white px-5 py-10 text-center">
          <p className="text-base font-medium text-[var(--ink)]">
            {isServiceUnavailable ? "商品数据暂时不可用" : "当前筛选条件下暂无商品"}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {isServiceUnavailable
              ? "请确认后端服务已启动，或稍后刷新页面重试。"
              : "请尝试更换关键词，或直接返回全部商品。"}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setKeywordDraft("");
                updateQuery(DEFAULT_QUERY);
              }}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              返回全部商品
            </button>
            <Link
              href="/contact"
              className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d1d1d]"
            >
              联系我们
            </Link>
          </div>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-white px-5 py-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            当前第 <span className="font-medium text-[var(--ink)]">{currentPage}</span> / {totalPages} 页，共 {totalProducts} 条结果
          </p>
          <div className="flex flex-wrap gap-2">
            <CatalogPageButton label="首页" onClick={() => goToPage(1)} disabled={currentPage <= 1} />
            <CatalogPageButton label="上一页" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} />
            <CatalogPageButton label="下一页" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages} />
            <CatalogPageButton label="末页" onClick={() => goToPage(totalPages)} disabled={currentPage >= totalPages} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CatalogPageButton({
  label,
  onClick,
  disabled
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-4 py-2 ${disabled ? "pointer-events-none border-[var(--line)] text-[var(--muted)]/50" : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
    >
      {label}
    </button>
  );
}

function ProductCard({ product }: { product: ShowcaseProductCard }) {
  const hasOriginalPrice = product.originalPrice !== null && product.originalPrice > product.price;
  const detailHref = `/products/${product.id}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.55rem] border border-[var(--line)] bg-white shadow-[0_12px_40px_rgba(16,16,16,0.06)] transition-colors duration-200 hover:border-[rgba(169,79,29,0.3)] focus-within:border-[rgba(169,79,29,0.45)]">
      <Link
        href={detailHref}
        aria-label={`查看 ${product.name} 详情`}
        className="absolute inset-0 z-10 rounded-[1.55rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
      />

      <div className="relative border-b border-[var(--line)] bg-[linear-gradient(180deg,#fffefb_0%,#f7efe2_100%)] p-3">
        {product.coverImage ? (
          <div className="aspect-[5/4] overflow-hidden rounded-[1.2rem] border border-[rgba(16,16,16,0.06)] bg-white">
            <img
              src={product.coverImage}
              alt={product.name}
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div
            className="flex aspect-[5/4] items-center justify-center rounded-[1.2rem] border border-[rgba(16,16,16,0.06)] px-6 text-center text-sm leading-7 text-[var(--muted)]"
            style={{ backgroundImage: product.coverTone }}
          >
            暂未上传商品图片
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
            <span>{product.categoryName}</span>
            <span className="h-1 w-1 rounded-full bg-[rgba(16,16,16,0.28)]" />
            <span>{product.sku}</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold leading-6 text-[var(--ink)]">{product.name}</h3>
            <p
              className="text-sm leading-6 text-[var(--muted)]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {product.summary}
            </p>
          </div>
        </div>

        <div className="mt-auto rounded-[1.4rem] border border-[rgba(16,16,16,0.05)] bg-[rgba(255,248,239,0.72)] p-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">价格</p>
              <p className="mt-1.5 text-lg font-semibold text-[var(--accent)]">{formatCurrency(product.price)}</p>
              {hasOriginalPrice ? (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  原价 <span className="line-through">{formatCurrency(product.originalPrice ?? 0)}</span>
                </p>
              ) : null}
            </div>

            <div className="rounded-[1rem] bg-white px-3 py-2 text-right shadow-[0_8px_18px_rgba(16,16,16,0.04)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">库存</p>
              <p className={`mt-1 text-sm font-semibold ${product.stock > 0 ? "text-[#315b4a]" : "text-[var(--ink)]"}`}>
                {product.stock > 0 ? `${product.stock} 件` : "售罄"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-2 gap-2">
          <Link
            href={detailHref}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            查看详情
          </Link>
          <a
            href={product.contactHref}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#8f4318]"
          >
            联系购买
          </a>
        </div>
      </div>
    </article>
  );
}
