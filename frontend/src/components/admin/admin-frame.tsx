"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getStoredAdminProfile } from "@/lib/auth";

type AdminFrameProps = {
  children: ReactNode;
};

const sectionMeta = [
  { match: "/admin/products", label: "商品工作区", description: "管理商品资料、图集、上架与推荐状态。" },
  { match: "/admin/categories", label: "分类工作区", description: "维护商品分类与前台展示顺序。" },
  { match: "/admin/contacts", label: "联系方式工作区", description: "维护咨询渠道、二维码与跳转链接。" },
  { match: "/admin/settings/home", label: "首页配置工作区", description: "更新首页文案、区块与展示节奏。" },
  { match: "/admin/settings", label: "站点设置工作区", description: "集中处理站点级配置与运营入口。" },
  { match: "/admin", label: "后台总览", description: "查看整体数据和常用入口。" }
] as const;

function getCurrentSection(pathname: string) {
  return sectionMeta.find((item) => pathname === item.match || pathname.startsWith(`${item.match}/`)) ?? sectionMeta[sectionMeta.length - 1];
}

export function AdminFrame({ children }: AdminFrameProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const profile = getStoredAdminProfile();
  const currentSection = getCurrentSection(pathname);

  return (
    <AdminAuthGuard>
      <div className="admin-app min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900">
        <div className="mx-auto grid max-w-[1680px] gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[296px_minmax(0,1fr)] lg:px-8">
          <AdminSidebar />
          <div className="min-w-0 space-y-4">
            <section className="admin-shell-card px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="admin-kicker">Workspace</p>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{currentSection.label}</h2>
                    <p className="text-sm leading-6 text-slate-500">{currentSection.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">当前账号</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{profile?.nickname || profile?.username || "管理员"}</p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">当前路径</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{pathname}</p>
                  </div>
                </div>
              </div>
            </section>
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
