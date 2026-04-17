import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";

const readinessItems = [
  {
    label: "商品模块",
    value: "运行中",
    hint: "商品列表、新增、编辑和图片上传功能完善。"
  },
  {
    label: "分类模块",
    value: "运行中",
    hint: "支持分类创建、编辑、启停和排序维护。"
  },
  {
    label: "联系方式",
    value: "运行中",
    hint: "可维护微信、Telegram、邮箱和二维码等联系入口。"
  },
  {
    label: "站点配置",
    value: "运行中",
    hint: "首页配置和 SEO 配置功能完善。"
  }
] as const;

const shortcuts = [
  {
    title: "商品管理",
    href: "/admin/products",
    description: "管理商品信息、库存和上下架状态。"
  },
  {
    title: "分类管理",
    href: "/admin/categories",
    description: "维护商品分类、排序和启停用状态。"
  },
  {
    title: "联系方式",
    href: "/admin/contacts",
    description: "维护微信、QQ、二维码和跳转入口。"
  },
  {
    title: "站点设置",
    href: "/admin/settings",
    description: "管理首页内容、SEO 和全局站点参数。"
  }
] as const;

export default function AdminIndexPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin / Overview"
          title="后台管理系统"
          description="管理商品、分类、联系方式和站点配置，轻松维护网站内容。"
          actions={
            <a
              href="/admin/settings"
              className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition-colors hover:bg-cyan-400/15"
            >
              打开设置中心
            </a>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard label="可管理模块" value="6" hint="商品、分类、联系方式与设置均已独立管理。" accent="cyan" />
          <AdminMetricCard label="后台入口" value="统一侧栏" hint="所有后台功能通过左侧菜单切换。" accent="emerald" />
          <AdminMetricCard label="当前模式" value="生产环境" hint="系统运行稳定，可正常使用。" accent="amber" />
          <AdminMetricCard label="系统状态" value="正常运行" hint="所有功能模块运行正常。" accent="violet" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <AdminPanel
            title="系统状态"
            description="后台各功能模块运行正常，可直接进入对应页面执行管理操作。"
            actions={
              <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                查看状态
              </button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {readinessItems.map((item) => (
                <article key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.hint}</p>
                </article>
              ))}
            </div>
          </AdminPanel>

          <div className="space-y-4">
            <AdminPanel title="快捷入口" description="快速进入各功能模块，执行商品、分类、联系方式和站点配置管理。">
              <div className="grid gap-3">
                {shortcuts.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group rounded-3xl border border-white/10 bg-slate-950/60 p-4 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-sm leading-6 text-slate-400">{item.description}</p>
                      </div>
                      <span className="mt-1 rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400 group-hover:text-cyan-100">
                        Open
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel title="使用说明" description="后台管理系统使用指南。">
              <ol className="space-y-3 text-sm leading-6 text-slate-300">
                <li className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">1. 从左侧菜单进入商品、分类或联系方式模块进行管理。</li>
                <li className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">2. 站点级配置集中在设置、首页配置和 SEO 配置页面。</li>
                <li className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">3. 所有操作实时生效，请谨慎修改重要配置。</li>
              </ol>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
