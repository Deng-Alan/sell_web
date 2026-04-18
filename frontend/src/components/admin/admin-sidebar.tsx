"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { getStoredAdminProfile, logoutAdmin } from "@/lib/auth";

const adminNavigationGroups = [
  {
    title: "总览",
    items: [{ label: "工作台", href: "/admin", hint: "查看整体数据与快捷入口" }]
  },
  {
    title: "内容管理",
    items: [
      { label: "商品管理", href: "/admin/products", hint: "维护商品资料与上下架" },
      { label: "分类管理", href: "/admin/categories", hint: "配置分类结构与顺序" },
      { label: "联系方式", href: "/admin/contacts", hint: "维护咨询渠道与二维码" }
    ]
  },
  {
    title: "站点设置",
    items: [
      { label: "设置中心", href: "/admin/settings", hint: "站点级配置入口" },
      { label: "首页配置", href: "/admin/settings/home", hint: "首页文案与区块管理" }
    ]
  }
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

  async function handleLogout() {
    await logoutAdmin();
    router.replace("/admin/login");
  }

  return (
    <aside className="admin-shell-card h-fit w-full max-w-[296px] p-5 lg:sticky lg:top-5 lg:min-h-[calc(100vh-2.5rem)]">
      <div className="space-y-5">
        <div className="space-y-3 border-b border-slate-200 pb-5">
          <p className="admin-kicker">Admin Panel</p>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">后台管理系统</h1>
            <p className="text-sm leading-6 text-slate-500">用更短的路径完成商品、联系方式和首页内容维护。</p>
          </div>
        </div>

        <div className="admin-subtle-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">当前账号</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{profile?.nickname || profile?.username || "管理员"}</p>
              <p className="mt-1 text-sm text-slate-500">{profile?.username ? `账号：${profile.username}` : "已启用本地登录态校验。"}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${profile ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {profile ? "在线" : "校验中"}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {adminNavigationGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{group.title}</p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "block rounded-[20px] border px-4 py-3 transition",
                        active ? "border-blue-200 bg-blue-50 shadow-sm" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50"
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className={`text-sm font-medium ${active ? "text-blue-700" : "text-slate-800"}`}>{item.label}</p>
                          <p className={`text-xs leading-5 ${active ? "text-blue-600/80" : "text-slate-500"}`}>{item.hint}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${active ? "bg-white text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                          {active ? "当前" : "进入"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="admin-subtle-card p-4">
          <p className="text-sm font-medium text-slate-900">操作提示</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>优先从左侧分组进入功能，减少来回跳转。</li>
            <li>首页配置和站点设置分开维护，职责更清晰。</li>
            <li>未登录会直接跳转后台登录页，不再展示后台工作区。</li>
          </ul>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
        <Link href="/" className="admin-button-secondary w-full">
          返回前台
        </Link>
        <button type="button" onClick={() => void handleLogout()} className="admin-button-primary w-full">
          退出登录
        </button>
      </div>
    </aside>
  );
}
