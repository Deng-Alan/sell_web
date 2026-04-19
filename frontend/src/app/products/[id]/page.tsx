import type { Metadata } from "next";
import Link from "next/link";

import { ProductDetailGallery } from "@/components/common/product-detail-gallery";
import { formatCurrency, loadPublicProductIds, loadPublicProductPage, type ShowcaseProductDetail } from "@/lib/public-catalog";

export const revalidate = 60;
export const dynamicParams = true;

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

function buildProductMetadata(product: ShowcaseProductDetail, id: string): Metadata {
  return {
    title: product.seoTitle || `${product.name} | 商品详情`,
    description: product.seoDescription || product.summary,
    alternates: {
      canonical: `/products/${id}`
    }
  };
}

function formatUpdatedAt(value: string) {
  return value.replace("T", " ").slice(0, 16);
}

function ProductMetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[rgba(16,16,16,0.08)] bg-[rgba(255,248,239,0.8)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
      {label}
    </span>
  );
}

function ProductDataRow({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[rgba(16,16,16,0.06)] py-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className={`text-right text-sm font-medium ${accent ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}>{value}</span>
    </div>
  );
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { product } = await loadPublicProductPage(id);
  if (!product) {
    return {
      title: "商品暂时不可用 | 商品展示",
      description: "当前无法获取该商品详情，请稍后重试。"
    };
  }

  return buildProductMetadata(product, id);
}

export async function generateStaticParams() {
  const ids = await loadPublicProductIds();
  return ids.map((id) => ({ id }));
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const { product, relatedProducts, source } = await loadPublicProductPage(id);

  if (!product) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#f4ecdf_100%)]">
        <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <Link href="/" className="transition hover:text-[var(--accent)]">
              首页
            </Link>
            <span>/</span>
            <span className="text-[var(--ink)]">商品详情</span>
          </div>

          <section className="rounded-[2rem] border border-[var(--line)] bg-white px-6 py-12 text-center shadow-[0_18px_60px_rgba(16,16,16,0.08)] sm:px-8">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">商品状态</p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">商品详情暂时不可用</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {source === "fallback"
                ? "当前无法连接后端服务，请确认服务已启动后再访问商品详情。"
                : "未找到对应商品，可能已下架或链接已失效。"}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                返回商品列表
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1d1d1d]"
              >
                联系购买
              </Link>
            </div>
          </section>
        </section>
      </main>
    );
  }

  const detailContent = product.description.trim() || product.summary.trim();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#f4ecdf_100%)]">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <Link href="/" className="transition hover:text-[var(--accent)]">
            首页
          </Link>
          <span>/</span>
          <span className="text-[var(--ink)]">{product.name}</span>
        </div>

        <section className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_60px_rgba(16,16,16,0.08)] sm:p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]">
            <ProductDetailGallery productName={product.name} coverImage={product.coverImage} galleryUrls={product.galleryUrls} />

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ProductMetaChip label={product.categoryName} />
                  <ProductMetaChip label={product.sku} />
                  <ProductMetaChip label={product.stock > 0 ? `库存 ${product.stock}` : "已售罄"} />
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">{product.name}</h1>
                  <p className="text-[15px] leading-8 text-[var(--muted)]">{product.summary}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.6rem] border border-[rgba(169,79,29,0.12)] bg-[linear-gradient(180deg,#fffaf2_0%,#fff3e2_100%)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">价格</p>
                  <p className="mt-3 text-4xl font-semibold text-[var(--ink)]">{formatCurrency(product.price)}</p>
                  {product.originalPrice !== null && product.originalPrice > product.price ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      原价 <span className="line-through">{formatCurrency(product.originalPrice)}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)]">人工客服确认后完成购买</p>
                  )}
                </div>

                <div className="rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,248,239,0.72)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">当前信息</p>
                  <div className="mt-3 space-y-3">
                    <ProductDataRow label="库存" value={product.stock > 0 ? `${product.stock} 件` : "售罄"} accent />
                    <ProductDataRow label="推荐位" value={product.featured ? "开启" : "关闭"} />
                    <ProductDataRow label="更新时间" value={formatUpdatedAt(product.updatedAt)} />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[rgba(169,79,29,0.16)] bg-[linear-gradient(180deg,rgba(255,248,239,0.96)_0%,rgba(255,243,229,0.92)_100%)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">联系购买</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">联系客服下单</h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
                      发送商品名称、截图或当前页面链接即可。默认客服渠道已在下方显示，也可以进入联系方式页选择微信或 QQ 购买入口。
                    </p>
                  </div>
                  <div className="rounded-full border border-[rgba(16,16,16,0.08)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)]">
                    {product.contactName}
                  </div>
                </div>

                <div className="mt-4 rounded-[1.35rem] border border-[rgba(16,16,16,0.06)] bg-white/90 p-4">
                  <ProductDataRow label="默认客服" value={product.contactName} />
                  <ProductDataRow label="联系账号" value={product.contactValue} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a
                    href={product.contactHref}
                    className="rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#8f4318]"
                  >
                    联系购买
                  </a>
                  <Link
                    href="/contact"
                    className="rounded-full border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    查看全部联系方式
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <article className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_60px_rgba(16,16,16,0.06)] sm:p-6 lg:p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">商品说明</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">详细信息</h2>
            <div className="mt-6 rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,249,241,0.7)] p-5">
              <p className="whitespace-pre-line break-words text-[15px] leading-8 text-[var(--muted)]">{detailContent}</p>
            </div>
          </article>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_60px_rgba(16,16,16,0.06)] sm:p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">商品参数</p>
              <div className="mt-4 space-y-1">
                <ProductDataRow label="分类" value={product.categoryName} />
                <ProductDataRow label="SKU" value={product.sku} />
                <ProductDataRow label="价格" value={formatCurrency(product.price)} />
                <ProductDataRow label="库存" value={product.stock > 0 ? `${product.stock} 件` : "售罄"} />
                <ProductDataRow label="更新时间" value={formatUpdatedAt(product.updatedAt)} />
              </div>
            </section>

            <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,248,239,0.96)] p-5 shadow-[0_18px_60px_rgba(16,16,16,0.06)] sm:p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">相关推荐</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">相关推荐</h2>
              <div className="mt-5 grid gap-3">
                {relatedProducts.length > 0 ? (
                  relatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 transition-colors hover:border-[var(--accent)]"
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">{item.categoryName}</p>
                      <p className="mt-2 text-base font-medium text-[var(--ink)]">{item.name}</p>
                      <p className="mt-2 text-sm font-medium text-[var(--ink)]">{formatCurrency(item.price)}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-white p-5 text-sm text-[var(--muted)]">
                    暂无更多相关推荐商品。
                  </div>
                )}
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
