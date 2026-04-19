import type { Metadata } from "next";
import Link from "next/link";

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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(169,79,29,0.08),transparent_24%),linear-gradient(180deg,#fff8ef_0%,#f4ecdf_100%)]">
        <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <Link href="/" className="transition hover:text-[var(--accent)]">
              首页
            </Link>
            <span>/</span>
            <span className="text-[var(--ink)]">商品详情</span>
          </div>

          <section className="rounded-[2rem] border border-[var(--line)] bg-white px-6 py-12 text-center shadow-[0_18px_60px_rgba(16,16,16,0.08)] sm:px-8">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">Unavailable</p>
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
                联系我们
              </Link>
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(169,79,29,0.08),transparent_24%),linear-gradient(180deg,#fff8ef_0%,#f4ecdf_100%)]">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <Link href="/" className="transition hover:text-[var(--accent)]">
            首页
          </Link>
          <span>/</span>
          <span className="text-[var(--ink)]">{product.name}</span>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_18px_60px_rgba(16,16,16,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div
              className="relative overflow-hidden px-5 py-6 text-white sm:px-8 sm:py-8 lg:px-10 lg:py-10"
              style={{ backgroundImage: product.coverTone }}
            >
              {product.coverImage ? (
                <img
                  src={product.coverImage}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : null}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(169,79,29,0.26),transparent_30%)]" />
              <div className="absolute inset-0 bg-black/28" />
              <div className="relative flex h-full flex-col gap-6">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/78">
                  <span>{product.categoryName}</span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 tracking-[0.18em]">
                    商品详情
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 tracking-[0.18em]">{product.sku}</span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-3xl break-words text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{product.name}</h1>
                  <p className="max-w-3xl whitespace-pre-line break-words text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
                    {product.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <HeroStat label="价格" value={formatCurrency(product.price)} />
                  <HeroStat label="库存" value={product.stock > 0 ? `${product.stock} 件` : "售罄"} />
                  <HeroStat label="推荐位" value={product.featured ? "开启" : "关闭"} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">封面图片</p>
                    {product.coverImage ? (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                        <img
                          src={product.coverImage}
                          alt={product.name}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-white/85">使用默认渐变背景</p>
                    )}
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">联系</p>
                    <p className="mt-2 text-sm leading-6 text-white/85">{product.contactHint}</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-5 bg-[rgba(255,249,241,0.96)] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">Price</p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-4xl font-semibold text-[var(--ink)]">{formatCurrency(product.price)}</p>
                    {product.originalPrice !== null && product.originalPrice > product.price ? (
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        原价 <span className="line-through">{formatCurrency(product.originalPrice)}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl bg-[var(--ink)] px-4 py-3 text-left text-white sm:text-right">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/65">库存</p>
                    <p className="mt-1 text-2xl font-semibold">{product.stock > 0 ? product.stock : "售罄"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[rgba(169,79,29,0.18)] bg-[rgba(169,79,29,0.06)] p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--accent)]">Contact</p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{product.contactHint}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={product.contactHref}
                    className="rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#8f4318]"
                  >
                    立即咨询
                  </a>
                  <Link
                    href="/contact"
                    className="rounded-full border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    查看联系方式
                  </Link>
                </div>
              </div>

              {product.galleryUrls.length > 0 ? (
                <div className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-[var(--accent)]">Gallery</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {product.galleryUrls.map((imageUrl) => (
                      <div key={imageUrl} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[rgba(255,249,241,0.96)]">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-28 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,249,241,0.92)] p-5 shadow-[0_18px_60px_rgba(16,16,16,0.06)] sm:p-6 lg:p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">Detail</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">详情信息区</h2>
            <div className="mt-6 space-y-5 text-sm leading-7 text-[var(--muted)]">
              <p className="whitespace-pre-line break-words text-[15px] leading-8">{product.summary}</p>

              <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
                <p className="text-sm font-medium text-[var(--ink)]">商品说明</p>
                <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-8 text-[var(--muted)]">{product.description}</p>
              </div>
            </div>
          </article>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,248,239,0.96)] p-5 shadow-[0_18px_60px_rgba(16,16,16,0.06)] sm:p-6 lg:p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">Related</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">相关推荐</h2>
              <div className="mt-5 grid gap-3">
                {relatedProducts.length > 0 ? (
                  relatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      className="rounded-3xl border border-[var(--line)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">{item.sku}</p>
                      <p className="mt-2 text-sm font-medium text-[var(--ink)]">{item.name}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-[var(--line)] bg-white p-5 text-sm text-[var(--muted)]">
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

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-white/62">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
