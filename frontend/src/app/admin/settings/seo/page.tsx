"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPill } from "@/components/admin/admin-status-pill";
import {
  createBlankSeoState,
  createSeoSummary,
  getSeoMetricSnapshot,
  loadSeoSettings,
  saveSeoSettings,
  seoRuleDefinitions,
  type SeoFormState,
  type SeoRuleId
} from "@/lib/admin-seo-settings";

type StatusBanner = {
  tone: "error" | "success" | "info";
  text: string;
};

function formatTimestamp(value: string) {
  if (!value) {
    return "暂无";
  }

  return value.replace("T", " ").slice(0, 19);
}

function getRuleStatus(filledFieldCount: number, totalFieldCount: number) {
  if (filledFieldCount === 0) {
    return { status: "draft", label: "未配置" };
  }

  if (filledFieldCount < totalFieldCount) {
    return { status: "pending", label: "部分完成" };
  }

  return { status: "indexed", label: "已配置" };
}

export default function AdminSeoSettingsPage() {
  const [seoState, setSeoState] = useState<SeoFormState>(() => createBlankSeoState());
  const [records, setRecords] = useState<Array<{ settingKey?: string | null; updatedAt?: string | null }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<StatusBanner | null>(null);

  const summary = useMemo(() => createSeoSummary(seoState), [seoState]);
  const metrics = useMemo(() => getSeoMetricSnapshot(seoState, records), [records, seoState]);

  useEffect(() => {
    void loadInitialSeoSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInitialSeoSettings(silent = false) {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const result = await loadSeoSettings();
      setSeoState(result.state);
      setRecords(result.records);
      setBanner({
        tone: "info",
        text: `已读取 ${result.records.length} 条 SEO 配置`
      });
    } catch (error) {
      setBanner({
        tone: "error",
        text: error instanceof Error ? error.message : "读取 SEO 配置失败"
      });
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }

  function updateField(ruleId: SeoRuleId, field: keyof SeoFormState[SeoRuleId], value: string) {
    setSeoState((current) => ({
      ...current,
      [ruleId]: {
        ...current[ruleId],
        [field]: value
      }
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    setBanner(null);

    try {
      await saveSeoSettings(seoState);
      await loadInitialSeoSettings(true);
      setBanner({
        tone: "success",
        text: "SEO 配置已保存"
      });
    } catch (error) {
      setBanner({
        tone: "error",
        text: error instanceof Error ? error.message : "保存 SEO 配置失败"
      });
    } finally {
      setIsSaving(false);
    }
  }

  const latestUpdatedAt = metrics.latestUpdatedAt || records.map((record) => record.updatedAt ?? "").find(Boolean) || "";

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin / Settings / SEO"
          title="SEO 配置页"
          description="直接读取和保存 `seo` 组配置，按规则模板管理标题、描述、关键词与 robots。字段不依赖独立表结构，保存时统一写回站点配置中心。"
          actions={
            <>
              <button
                type="button"
                onClick={() => void loadInitialSeoSettings(true)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading || isSaving}
              >
                重新读取
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading || isSaving}
              >
                {isSaving ? "保存中..." : "保存全部规则"}
              </button>
            </>
          }
        />

        {banner ? (
          <div
            className={[
              "rounded-2xl border px-4 py-3 text-sm backdrop-blur-sm",
              banner.tone === "error"
                ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
                : banner.tone === "success"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                  : "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
            ].join(" ")}
          >
            {banner.text}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <AdminMetricCard
            label="规则总数"
            value={String(summary.length)}
            hint="首页、分类页、商品页、后台页四组模板"
            accent="cyan"
          />
          <AdminMetricCard
            label="已填字段"
            value={String(metrics.totalFilled)}
            hint="当前页面中已经写入的模板字段总数"
            accent="emerald"
          />
          <AdminMetricCard
            label="完整规则"
            value={String(metrics.completedRules)}
            hint="四个字段都已配置的 SEO 规则数量"
            accent="amber"
          />
          <AdminMetricCard
            label="最近更新"
            value={latestUpdatedAt ? formatTimestamp(latestUpdatedAt) : "暂无"}
            hint="来自站点配置中心的更新时间"
            accent="violet"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-4">
            <AdminPanel
              title="SEO 规则编辑器"
              description="每个规则直接映射到 `seo.{page}.{field}` key。保存后会批量写回 `/api/site-settings/groups/seo`。"
              actions={
                <div className="flex flex-wrap gap-2">
                  <AdminStatusPill status={metrics.emptyRules === summary.length ? "draft" : "published"} label={isLoading ? "加载中" : "已就绪"} />
                </div>
              }
            >
              <div className="space-y-4">
                {summary.map((rule) => {
                  const fields = seoState[rule.id];
                  const status = getRuleStatus(rule.filledFieldCount, rule.totalFieldCount);

                  return (
                    <section
                      key={rule.id}
                      className="rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-4 shadow-lg shadow-black/10"
                    >
                      <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-white">{rule.pageName}</h3>
                            <AdminStatusPill status={status.status} label={status.label} />
                          </div>
                          <p className="text-sm leading-6 text-slate-400">
                            {rule.route} · {rule.note}
                          </p>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                          已填 {rule.filledFieldCount}/{rule.totalFieldCount}
                        </div>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-2">
                        <AdminField label="标题模板" hint="例如：{{pageName}} - {{siteName}}" required>
                          <input
                            value={fields.titleTemplate}
                            onChange={(event) => updateField(rule.id, "titleTemplate", event.target.value)}
                            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                            placeholder={rule.id === "admin" ? "Admin - {{siteName}}" : "{{pageName}} - {{siteName}}"}
                          />
                        </AdminField>

                        <AdminField label="robots" hint="可写入 index,follow 或 noindex,nofollow" required>
                          <input
                            value={fields.robots}
                            onChange={(event) => updateField(rule.id, "robots", event.target.value)}
                            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                            placeholder={rule.id === "admin" ? "noindex,nofollow" : "index,follow"}
                          />
                        </AdminField>

                        <AdminField className="xl:col-span-2" label="描述模板" hint="用于 meta description 与摘要展示" required>
                          <textarea
                            value={fields.descriptionTemplate}
                            onChange={(event) => updateField(rule.id, "descriptionTemplate", event.target.value)}
                            className="min-h-28 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                            placeholder="输入页面描述模板，支持站点变量和内容变量"
                          />
                        </AdminField>

                        <AdminField className="xl:col-span-2" label="关键词" hint="可选字段，使用英文逗号分隔">
                          <input
                            value={fields.keywords}
                            onChange={(event) => updateField(rule.id, "keywords", event.target.value)}
                            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                            placeholder="keyword-a, keyword-b, keyword-c"
                          />
                        </AdminField>
                      </div>
                    </section>
                  );
                })}
              </div>
            </AdminPanel>
          </div>

          <div className="space-y-4">
            <AdminPanel title="当前配置概览" description="这个页不做死表结构，页面字段按现有 SEO 组 key-value 直接映射。">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">读取来源</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">GET /api/site-settings?groupName=seo</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">保存目标</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">PUT /api/site-settings/groups/seo</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">字段命名</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">seo.home.titleTemplate / seo.product.descriptionTemplate / seo.admin.robots</p>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="规则状态" description="当前 SEO 模板完成度一眼看清。">
              <div className="space-y-3">
                {summary.map((rule) => {
                  const status = getRuleStatus(rule.filledFieldCount, rule.totalFieldCount);
                  return (
                    <div key={rule.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{rule.pageName}</p>
                        <p className="text-xs text-slate-500">{rule.route}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          {rule.filledFieldCount}/{rule.totalFieldCount}
                        </span>
                        <AdminStatusPill status={status.status} label={status.label} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminPanel>

            <AdminPanel title="联调说明" description="后续如果 SEO 规则继续扩展，可以只加 key，不需要改表结构。">
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                <li>1. 标题、描述、关键词和 robots 都是独立字段，可以按规则单独维护。</li>
                <li>2. 当前保存会覆盖本页四组规则的对应 key，但不会触碰其他 group 的配置。</li>
                <li>3. 如果后端以后新增 canonical、OG、结构化数据，只需要继续扩展这个映射层。</li>
              </ul>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
