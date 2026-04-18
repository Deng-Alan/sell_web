"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { loadAdminDashboard, type AdminDashboardViewModel } from "@/lib/admin-dashboard";

const quickLinks = [
  {
    title: "商品管理",
    href: "/admin/products",
    description: "查看商品库存、推荐状态和上下架信息。"
  },
  {
    title: "分类管理",
    href: "/admin/categories",
    description: "维护商品分类与前台展示结构。"
  },
  {
    title: "联系方式",
    href: "/admin/contacts",
    description: "管理微信、Telegram、二维码和邮箱等联系入口。"
  },
  {
    title: "首页配置",
    href: "/admin/settings/home",
    description: "更新首页文案、区块和站点承接信息。"
  }
] as const;

const donutColors = ["#2563eb", "#10b981", "#f59e0b"];

export default function AdminOverviewPage() {
  const [viewModel, setViewModel] = useState<AdminDashboardViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const nextViewModel = await loadAdminDashboard();
      setViewModel(nextViewModel);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "读取后台统计失败");
      setViewModel(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const metrics = viewModel?.metrics ?? [];
  const summaryItems = useMemo(
    () => [
      {
        label: "商品启用率",
        value:
          viewModel && viewModel.stats.totalProducts > 0
            ? `${Math.round((viewModel.stats.activeProducts / viewModel.stats.totalProducts) * 100)}%`
            : "—"
      },
      {
        label: "分类启用率",
        value:
          viewModel && viewModel.stats.totalCategories > 0
            ? `${Math.round((viewModel.stats.activeCategories / viewModel.stats.totalCategories) * 100)}%`
            : "—"
      },
      {
        label: "联系方式启用率",
        value:
          viewModel && viewModel.stats.totalContacts > 0
            ? `${Math.round((viewModel.stats.activeContacts / viewModel.stats.totalContacts) * 100)}%`
            : "—"
      }
    ],
    [viewModel]
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="后台总览"
          title="运营工作台"
          description="优先展示最常看的统计、模块入口和当前站点维护重点，降低后台上手门槛。"
          actions={
            <>
              <button className="admin-button-secondary" onClick={() => void refresh()} type="button" disabled={loading}>
                {loading ? "刷新中..." : "刷新数据"}
              </button>
              <Link href="/admin/products" className="admin-button-primary">
                进入商品管理
              </Link>
            </>
          }
        />

        {error ? <AdminNotice tone="error" message={error} /> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={`metric-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="mb-4 h-12 rounded-2xl bg-slate-200" />
                  <div className="h-4 w-24 rounded-full bg-slate-200" />
                  <div className="mt-3 h-8 w-16 rounded-full bg-slate-300" />
                  <div className="mt-3 h-3 w-40 rounded-full bg-slate-200" />
                </div>
              ))
            : metrics.map((metric) => (
                <AdminMetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} accent={metric.accent} />
              ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <AdminPanel title="模块数据概览" description="对比各模块总量与已启用数量，快速判断当前数据是否完整。">
            {viewModel ? (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="h-[320px] rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={viewModel.moduleBars} barGap={12}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" />
                      <YAxis axisLine={false} tickLine={false} stroke="#64748b" allowDecimals={false} />
                      <Tooltip cursor={{ fill: "rgba(37,99,235,0.06)" }} />
                      <Bar dataKey="total" name="总量" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="active" name="已启用" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={viewModel.productMix}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={54}
                          outerRadius={82}
                          paddingAngle={3}
                        >
                          {viewModel.productMix.map((entry, index) => (
                            <Cell key={entry.name} fill={donutColors[index % donutColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {viewModel.productMix.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: donutColors[index % donutColors.length] }} />
                          <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <AdminEmptyState title="暂时无法显示统计图表" description="请先确认后台接口与登录状态正常，然后重新刷新数据。" />
            )}
          </AdminPanel>

          <div className="space-y-6">
            <AdminPanel title="今日重点" description="新手打开后台后优先看到的关键信息。">
              <div className="grid gap-3">
                {summaryItems.map((item) => (
                  <div key={item.label} className="admin-subtle-card flex items-center justify-between px-4 py-4">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-lg font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel title="快捷入口" description="常用操作集中放在这里，减少新手找功能的时间。">
              <div className="grid gap-3">
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm leading-6 text-slate-500">{item.description}</p>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">进入</span>
                    </div>
                  </Link>
                ))}
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
