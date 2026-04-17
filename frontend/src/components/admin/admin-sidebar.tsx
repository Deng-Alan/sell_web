"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearStoredAdminAuth, getStoredAdminProfile } from "@/lib/auth";

const adminNavigation = [
  { label: "商品管理", href: "/admin/products" },
  { label: "分类管理", href: "/admin/categories" },
  { label: "联系方式", href: "/admin/contacts" },
  { label: "站点设置", href: "/admin/settings" },
  { label: "首页配置", href: "/admin/settings/home" }
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = getStoredAdminProfile();

  function handleLogout() {
    clearStoredAdminAuth();
    router.replace("/admin/login");
  }

  return (
    <aside className="flex h-full min-h-[calc(100vh-3rem)] w-full max-w-[280px] flex-col rounded-[2rem] border border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-black/25">
      <div className="space-y-4 border-b border-white/10 pb-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.34em] text-cyan-300/85">Admin Panel</p>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">后台管理系统</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">统一管理商品、分类、联系方式和站点配置。</p>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">当前账号</p>
          <p className="mt-2 text-sm font-medium text-white">{profile?.nickname || profile?.username || "未登录"}</p>
          <p className="mt-1 text-sm text-slate-400">{profile?.username ? `账号：${profile.username}` : "登录后进入后台模块。"}</p>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-2">
        {adminNavigation.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center justify-between rounded-[1.2rem] border px-4 py-3 text-sm transition-colors",
                active
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
              ].join(" ")}
            >
              <span>{item.label}</span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-inherit/70">Open</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
        <Link
          href="/"
          className="flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition-colors hover:bg-white/[0.08]"
        >
          返回前台
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-full border border-cyan-400/30 bg-cyan-400 px-4 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-300"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
