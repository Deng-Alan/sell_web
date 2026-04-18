"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { hasStoredAdminAuthToken } from "@/lib/auth";

type AdminAuthGuardProps = {
  children: ReactNode;
};

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authorized">("checking");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setStatus("authorized");
      return;
    }

    if (!hasStoredAdminAuthToken()) {
      router.replace("/admin/login");
      return;
    }

    setStatus("authorized");
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status !== "authorized") {
    return (
      <div className="admin-app flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 text-slate-900">
        <section className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/95 px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="admin-kicker">Access Check</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">正在检查后台登录状态</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">未检测到本地登录态时，将自动跳转到后台登录页。</p>
        </section>
      </div>
    );
  }

  return <>{children}</>;
}
