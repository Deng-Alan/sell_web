import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">404 NOT FOUND</p>
        <h2 className="text-3xl font-semibold text-[var(--ink)] sm:text-5xl">找不到该页面</h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-[var(--muted)]">
          您访问的链接可能已经失效，或者页面已经被移动。您可以返回首页查看最新公开展示的商品目录。
        </p>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1d1d1d]"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
