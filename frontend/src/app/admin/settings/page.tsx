"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { loadAdminSiteSettings, saveAdminSiteSetting, type AdminSiteSettingRecord } from "@/lib/admin-site-settings";

const settingsRoutes = [
  { title: "首页配置", href: "/admin/settings/home", description: "管理首屏文案、Banner、模块开关和公告。" },
  { title: "联系方式", href: "/admin/contacts", description: "维护微信、电话、二维码和外链入口。" },
  { title: "商品管理", href: "/admin/products", description: "进入商品 CRUD 页面，维护商品资料和上下架。" }
] as const;

function formatDateTime(value: string | null) {
  return value ? value.replace("T", " ").slice(0, 19) : "-";
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSiteSettingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [formState, setFormState] = useState({
    settingKey: "",
    settingValue: "",
    groupName: "general"
  });
  const [notice, setNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  async function refreshSettings(preferredKey?: string) {
    const nextSettings = await loadAdminSiteSettings();
    setSettings(nextSettings);

    const nextSelected = (preferredKey ? nextSettings.find((item) => item.settingKey === preferredKey) : null) ?? nextSettings[0] ?? null;
    if (nextSelected) {
      setSelectedKey(nextSelected.settingKey);
      setFormState({
        settingKey: nextSelected.settingKey,
        settingValue: nextSelected.settingValue ?? "",
        groupName: nextSelected.groupName ?? "general"
      });
      return;
    }

    setSelectedKey("");
    setFormState({
      settingKey: "",
      settingValue: "",
      groupName: "general"
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        await refreshSettings();
      } catch (error) {
        if (!cancelled) {
          setNotice({ kind: "error", message: error instanceof Error ? error.message : "站点设置加载失败" });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const groups = new Set(settings.map((item) => item.groupName || "general"));
    return {
      total: settings.length,
      groups: groups.size,
      home: settings.filter((item) => item.groupName === "home").length,
      updated: settings.filter((item) => item.updatedAt).length
    };
  }, [settings]);

  async function handleSave() {
    setSaving(true);
    setNotice(null);

    try {
      const saved = await saveAdminSiteSetting(formState.settingKey, formState.settingValue, formState.groupName);
      setNotice({ kind: "success", message: `设置项 ${saved.settingKey} 已保存` });
      await refreshSettings(saved.settingKey);
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "保存站点设置失败" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="站点管理 / 设置"
          title="站点设置中心"
          description="这里集中管理站点级参数，并保留首页、商品和联系方式入口。"
          actions={
            <>
              <button type="button" onClick={() => void refreshSettings(selectedKey)} className="admin-button-secondary">
                刷新配置
              </button>
              <a href="/admin/settings/home" className="admin-button-primary">
                首页设置
              </a>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard label="配置总数" value={String(metrics.total)} hint="当前已读取到的站点设置项。" accent="cyan" />
          <AdminMetricCard label="分组数量" value={String(metrics.groups)} hint="按 groupName 区分不同配置域。" accent="emerald" />
          <AdminMetricCard label="首页配置" value={String(metrics.home)} hint="home 分组下的设置项数量。" accent="amber" />
          <AdminMetricCard label="已写入" value={String(metrics.updated)} hint="存在更新时间的设置项数量。" accent="violet" />
        </div>

        {notice ? <AdminNotice tone={notice.kind} message={notice.message} /> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <AdminPanel
            title="设置导航"
            description="从这里进入具体配置页，完成首页和相关站点内容维护。"
            actions={
              <button className="admin-button-secondary px-3 py-1.5 text-xs" type="button" onClick={() => void refreshSettings(selectedKey)}>
                重新读取
              </button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {settingsRoutes.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/50"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-700">
                        进入
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </AdminPanel>

          <div className="space-y-4">
            <AdminPanel title="设置编辑器" description="支持选中已有配置项编辑，也支持新建单个配置项。">
              <div className="grid gap-4">
                <AdminField label="配置分组" hint="例如 general / home / seo。">
                  <input
                    value={formState.groupName}
                    onChange={(event) => setFormState((current) => ({ ...current, groupName: event.target.value }))}
                    className="admin-input"
                    placeholder="general"
                  />
                </AdminField>
                <AdminField label="配置键" hint="必须唯一，例如 site_name。">
                  <input
                    value={formState.settingKey}
                    onChange={(event) => setFormState((current) => ({ ...current, settingKey: event.target.value }))}
                    className="admin-input"
                    placeholder="site_name"
                  />
                </AdminField>
                <AdminField label="配置值" hint="站点级文案、链接或 JSON 内容。">
                  <textarea
                    value={formState.settingValue}
                    onChange={(event) => setFormState((current) => ({ ...current, settingValue: event.target.value }))}
                    className="admin-textarea min-h-[132px]"
                    placeholder="请输入配置值"
                  />
                </AdminField>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => void handleSave()} disabled={saving} className="admin-button-primary">
                    {saving ? "保存中..." : "保存设置"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKey("");
                      setFormState({ settingKey: "", settingValue: "", groupName: "general" });
                    }}
                    className="admin-button-secondary"
                  >
                    新建设置项
                  </button>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="配置项列表" description="点击右侧“载入”可以把现有设置放入编辑器。">
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)
                ) : settings.length > 0 ? (
                  settings.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-3xl border p-4 ${selectedKey === item.settingKey ? "border-blue-300 bg-blue-50/60" : "border-slate-200 bg-slate-50"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{item.settingKey}</p>
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                              {item.groupName || "general"}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{item.settingValue || "空值"}</p>
                          <p className="text-xs text-slate-500">更新时间：{formatDateTime(item.updatedAt)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedKey(item.settingKey);
                            setFormState({
                              settingKey: item.settingKey,
                              settingValue: item.settingValue ?? "",
                              groupName: item.groupName ?? "general"
                            });
                          }}
                          className="admin-button-secondary px-3 py-1.5 text-xs"
                        >
                          载入
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    当前还没有站点设置数据，可以先创建一条配置项。
                  </div>
                )}
              </div>
            </AdminPanel>

            <AdminPanel title="使用说明" description="设置中心现在接真实接口。">
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li>1. 站点级参数统一通过 `/api/site-settings` 读写。</li>
                <li>2. 首页大字段继续放在 `home` 分组，并在首页配置页集中维护。</li>
                <li>3. 这里适合补充通用设置、SEO 文案和域名类配置。</li>
              </ul>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
