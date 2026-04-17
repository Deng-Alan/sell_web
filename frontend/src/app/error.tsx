"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可以在此处将错误抛给监控分析服务，如 Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_18px_60px_rgba(16,16,16,0.06)] sm:p-12">
        <h2 className="text-2xl font-semibold text-[var(--ink)]">页面出现错误</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
          非常抱歉，我们在获取数据或进行页面渲染时遇到了问题。我们的系统已经记录了该异常。
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1d1d1d]"
          >
            重试一次
          </button>
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
