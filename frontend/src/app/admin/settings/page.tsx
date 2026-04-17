import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";

const settingsRoutes = [
  {
    title: "首页配置",
    href: "/admin/settings/home",
    description: "管理首屏文案、Banner、模块开关和公告。"
  },
  {
    title: "SEO 配置",
    href: "/admin/settings/seo",
    description: "维护标题模板、描述模板和索引规则。"
  },
  {
    title: "联系方式",
    href: "/admin/contacts",
    description: "处理微信、QQ、二维码和外链入口。"
  },
  {
    title: "商品管理",
    href: "/admin/products",
    description: "进入商品 CRUD 页面，继续补齐上架和编辑流程。"
  }
] as const;

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin / Settings"
          title="站点设置中心"
          description="这里集中管理首页配置、SEO 配置以及站点级维护入口。"
          actions={
            <>
              <a
                href="/admin/settings/home"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10"
              >
                首页设置
              </a>
              <a
                href="/admin/settings/seo"
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition-colors hover:bg-cyan-400/15"
              >
                SEO 设置
              </a>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard label="核心设置页" value="2" hint="首页配置与 SEO 配置作为主要站点设置入口。" accent="cyan" />
          <AdminMetricCard label="关联模块" value="4" hint="商品、联系方式、首页内容和搜索规则都受这里影响。" accent="emerald" />
          <AdminMetricCard label="配置方式" value="集中维护" hint="统一通过后台设置页面进行维护和保存。" accent="amber" />
          <AdminMetricCard label="当前状态" value="可操作" hint="已经可以进入细分配置页继续维护。" accent="violet" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <AdminPanel
            title="设置导航"
            description="从这里进入具体配置页，完成首页、SEO 和相关站点内容维护。"
            actions={
              <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                查看配置项
              </button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {settingsRoutes.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group rounded-3xl border border-white/10 bg-slate-950/60 p-4 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400 group-hover:text-cyan-100">
                        Open
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </AdminPanel>

          <div className="space-y-4">
            <AdminPanel title="全局参数" description="先把最常用的站点级字段位点摆出来，后面可以直接接保存接口。">
              <div className="grid gap-4">
                <AdminField label="站点名称" hint="显示在后台标题和对外网站标题中。">
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-500">
                    Sell Web
                  </div>
                </AdminField>
                <AdminField label="主域名" hint="用于生成 canonical 和站点链接。">
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-500">
                    https://example.com
                  </div>
                </AdminField>
                <AdminField label="默认客服入口" hint="前台咨询按钮的默认跳转。">
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-500">
                    WeChat / QQ / QR
                  </div>
                </AdminField>
                <AdminField label="发布状态" hint="草稿、预览或已发布。">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                      预览中
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      待保存
                    </span>
                  </div>
                </AdminField>
              </div>
            </AdminPanel>

            <AdminPanel title="使用说明" description="设置中心作为站点管理入口，后续新增站点级能力也继续挂在这里。">
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                <li>1. 首页设置和 SEO 设置保持独立页面，便于持续维护。</li>
                <li>2. 商品和联系方式模块的展示结果，会直接影响前台页面表现。</li>
                <li>3. 后续新增公告、支付或运营配置时，可以继续挂到这里。</li>
              </ul>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
