"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPill } from "@/components/admin/admin-status-pill";
import {
  createEmptyHomeSettingsFormState,
  createHomeSectionDraft,
  createHomeSettingsFormState,
  deleteHomeSection,
  homeSettingGroups,
  loadAdminHomeSettings,
  saveHomeSection,
  saveHomeSiteSettings,
  sectionStatusLabel,
  sectionStatusTone,
  type AdminHomeSectionDraft,
  type AdminHomeSectionRecord,
  type AdminHomeSettingsFormState,
  type AdminHomeSettingsSnapshot
} from "@/lib/admin-home-settings";

const inputClassName =
  "admin-input";

const textAreaClassName =
  "admin-textarea";

const selectClassName =
  "admin-select";

type NoticeTone = "success" | "warning" | "error";

type NoticeState = {
  tone: NoticeTone;
  message: string;
} | null;

const sectionKeySuggestions = ["hero_banner", "featured_products", "workflow", "contact_us"];

function noticeClassName(tone: NoticeTone) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

function renderNotice(notice: NoticeState) {
  if (!notice) {
    return null;
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${noticeClassName(notice.tone)}`}>{notice.message}</div>
  );
}

function sectionDraftTitle(section: AdminHomeSectionRecord) {
  return section.title?.trim() || section.sectionKey;
}

type SectionEditorCardProps = {
  title: string;
  sectionKey: string;
  draft: AdminHomeSectionDraft;
  readonlyKey?: boolean;
  onSectionKeyChange?: (nextValue: string) => void;
  onDraftChange: (patch: Partial<AdminHomeSectionDraft>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  hint?: string;
};

function SectionEditorCard({
  title,
  sectionKey,
  draft,
  readonlyKey = false,
  onSectionKeyChange,
  onDraftChange,
  onSave,
  saving,
  hint
}: SectionEditorCardProps) {
  return (
    <AdminPanel
      title={title}
      description={hint}
      actions={
        <button
          className="admin-button-primary"
          onClick={() => void onSave()}
          disabled={saving || !sectionKey.trim()}
          type="button"
        >
          {saving ? "保存中..." : "保存区块"}
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminField label="sectionKey" hint="区块唯一标识" required className="lg:col-span-2">
          {readonlyKey ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {sectionKey}
            </div>
          ) : (
            <input
              className={inputClassName}
              placeholder="hero_banner"
              value={sectionKey}
              onChange={(event) => onSectionKeyChange?.(event.target.value)}
            />
          )}
        </AdminField>

        <AdminField label="标题" hint="对应区块标题，前台会直接读取。">
          <input
            className={inputClassName}
            placeholder="首页 Hero"
            value={draft.title}
            onChange={(event) => onDraftChange({ title: event.target.value })}
          />
        </AdminField>

        <AdminField label="排序" hint="数字越小越靠前。">
          <input
            className={inputClassName}
            type="number"
            min={0}
            placeholder="0"
            value={draft.sortOrder}
            onChange={(event) => onDraftChange({ sortOrder: event.target.value })}
          />
        </AdminField>

        <AdminField label="内容" hint="用于展示正文、说明或承接文案。" className="lg:col-span-2">
          <textarea
            className={textAreaClassName}
            rows={4}
            placeholder="这里填写区块内容"
            value={draft.content}
            onChange={(event) => onDraftChange({ content: event.target.value })}
          />
        </AdminField>

        <AdminField label="图片 URL" hint="用于区块图片或封面图。" className="lg:col-span-2">
          <input
            className={inputClassName}
            placeholder="https://..."
            value={draft.imageUrl}
            onChange={(event) => onDraftChange({ imageUrl: event.target.value })}
          />
        </AdminField>

        <AdminField label="扩展 JSON" hint="保留给轮播、按钮组、指标等扩展配置。" className="lg:col-span-2">
          <textarea
            className={textAreaClassName}
            rows={5}
            placeholder='{"metrics":[...]}'
            value={draft.extraJson}
            onChange={(event) => onDraftChange({ extraJson: event.target.value })}
          />
        </AdminField>

        <AdminField label="状态" hint="1 = 显示，0 = 隐藏。">
          <select
            className={selectClassName}
            value={draft.status}
            onChange={(event) => onDraftChange({ status: event.target.value as "0" | "1" })}
          >
            <option value="1">显示</option>
            <option value="0">隐藏</option>
          </select>
        </AdminField>
      </div>
    </AdminPanel>
  );
}

function HomeSectionCard({
  section,
  draft,
  onDraftChange,
  onSave,
  onDelete,
  saving
}: {
  section: AdminHomeSectionRecord;
  draft: AdminHomeSectionDraft;
  onDraftChange: (patch: Partial<AdminHomeSectionDraft>) => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  saving: boolean;
}) {
  return (
    <section className="rounded-[1.65rem] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{sectionDraftTitle(section)}</h3>
            <AdminStatusPill status={sectionStatusTone(section.status)} label={sectionStatusLabel(section.status)} />
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span>key: {section.sectionKey}</span>
            <span>sort: {section.sortOrder ?? 0}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="admin-button-secondary px-4 py-2 text-xs"
            onClick={() => void onSave()}
            disabled={saving}
            type="button"
          >
            {saving ? "保存中..." : "保存区块"}
          </button>
          <button
            className="admin-button-danger px-4 py-2 text-xs"
            onClick={() => void onDelete()}
            disabled={saving}
            type="button"
          >
            删除
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminField label="标题" hint="修改后会同步到区块标题。">
          <input
            className={inputClassName}
            value={draft.title}
            onChange={(event) => onDraftChange({ title: event.target.value })}
          />
        </AdminField>

        <AdminField label="排序" hint="越小越靠前。">
          <input
            className={inputClassName}
            type="number"
            min={0}
            value={draft.sortOrder}
            onChange={(event) => onDraftChange({ sortOrder: event.target.value })}
          />
        </AdminField>

        <AdminField label="内容" hint="区块正文或说明。" className="xl:col-span-2">
          <textarea
            className={textAreaClassName}
            rows={4}
            value={draft.content}
            onChange={(event) => onDraftChange({ content: event.target.value })}
          />
        </AdminField>

        <AdminField label="图片 URL" hint="可直接替换当前图片地址。" className="xl:col-span-2">
          <input
            className={inputClassName}
            value={draft.imageUrl}
            onChange={(event) => onDraftChange({ imageUrl: event.target.value })}
          />
        </AdminField>

        <AdminField label="扩展 JSON" hint="保留给后续轮播、按钮和指标配置。" className="xl:col-span-2">
          <textarea
            className={textAreaClassName}
            rows={5}
            value={draft.extraJson}
            onChange={(event) => onDraftChange({ extraJson: event.target.value })}
          />
        </AdminField>

        <AdminField label="状态" hint="1 = 显示，0 = 隐藏。">
          <select
            className={selectClassName}
            value={draft.status}
            onChange={(event) => onDraftChange({ status: event.target.value as "0" | "1" })}
          >
            <option value="1">显示</option>
            <option value="0">隐藏</option>
          </select>
        </AdminField>
      </div>
    </section>
  );
}

export default function AdminHomeSettingsPage() {
  const [snapshot, setSnapshot] = useState<AdminHomeSettingsSnapshot | null>(null);
  const [settingsForm, setSettingsForm] = useState<AdminHomeSettingsFormState>(() => createEmptyHomeSettingsFormState());
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, AdminHomeSectionDraft>>({});
  const [newSectionKey, setNewSectionKey] = useState("hero_banner");
  const [newSectionDraft, setNewSectionDraft] = useState<AdminHomeSectionDraft>(() => createHomeSectionDraft());
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSectionKey, setSavingSectionKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);

  async function refreshHomeSettings(showNotice = true) {
    setLoading(true);

    try {
      const nextSnapshot = await loadAdminHomeSettings();
      setSnapshot(nextSnapshot);
      setSettingsForm(createHomeSettingsFormState(nextSnapshot.siteSettings));
      setSectionDrafts(
        nextSnapshot.homeSections.reduce<Record<string, AdminHomeSectionDraft>>((accumulator, section) => {
          accumulator[section.sectionKey] = createHomeSectionDraft(section);
          return accumulator;
        }, {})
      );

      if (showNotice) {
        if (nextSnapshot.errors.length > 0) {
          setNotice({
            tone: "warning",
            message: `部分数据加载失败：${nextSnapshot.errors.join("；")}`
          });
        } else {
          setNotice({
            tone: "success",
            message: "首页配置已加载"
          });
        }
      }
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "读取首页配置失败"
      });
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshHomeSettings(true);
  }, []);

  const sections = snapshot?.homeSections ?? [];
  const enabledSections = sections.filter((section) => section.status === 1).length;
  const sourceLabel = snapshot?.source ?? "fallback";
  const sourcePill = sourceLabel === "api" ? "published" : sourceLabel === "partial" ? "pending" : "draft";

  async function handleSaveSettings() {
    setSavingSettings(true);
    setNotice(null);

    try {
      await saveHomeSiteSettings(settingsForm);
      setNotice({
        tone: "success",
        message: "站点设置已保存"
      });
      await refreshHomeSettings(false);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "保存站点设置失败"
      });
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveSection(sectionKey: string, draft: AdminHomeSectionDraft) {
    const trimmedKey = sectionKey.trim();
    if (!trimmedKey) {
      setNotice({
        tone: "error",
        message: "sectionKey 不能为空"
      });
      return;
    }

    setSavingSectionKey(trimmedKey);
    setNotice(null);

    try {
      await saveHomeSection(trimmedKey, draft);
      setNotice({
        tone: "success",
        message: `区块 ${trimmedKey} 已保存`
      });
      await refreshHomeSettings(false);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "保存区块失败"
      });
    } finally {
      setSavingSectionKey(null);
    }
  }

  async function handleDeleteSection(section: AdminHomeSectionRecord) {
    const confirmed = window.confirm(`确认删除首页区块「${section.sectionKey}」吗？此操作不可恢复。`);
    if (!confirmed) {
      return;
    }

    setSavingSectionKey(section.sectionKey);
    setNotice(null);

    try {
      await deleteHomeSection(section.sectionKey);
      setNotice({
        tone: "success",
        message: `区块 ${section.sectionKey} 已删除`
      });
      await refreshHomeSettings(false);
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "删除区块失败"
      });
    } finally {
      setSavingSectionKey(null);
    }
  }

  const previewFields = useMemo(
    () => [
      { label: "读取来源", value: sourceLabel === "api" ? "在线" : sourceLabel === "partial" ? "部分" : "离线" },
      { label: "站点设置", value: String(snapshot?.siteSettings.length ?? 0) },
      { label: "首页区块", value: String(sections.length) },
      { label: "已启用", value: String(enabledSections) }
    ],
    [enabledSections, sections.length, sourceLabel, snapshot?.siteSettings.length]
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="站点设置 / 首页配置"
          title="首页配置"
          description="管理站点设置与首页区块,支持读取、编辑和保存。"
          actions={
            <>
              <button
                className="admin-button-secondary"
                onClick={() => void refreshHomeSettings(true)}
                disabled={loading}
                type="button"
              >
                {loading ? "读取中..." : "重新读取"}
              </button>
              <button
                className="admin-button-primary"
                onClick={() => void handleSaveSettings()}
                disabled={loading || savingSettings}
                type="button"
              >
                {savingSettings ? "保存中..." : "保存站点设置"}
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          {previewFields.map((field) => (
            <AdminMetricCard key={field.label} label={field.label} value={field.value} hint="配置状态和数量统计" accent="cyan" />
          ))}
        </div>

        {renderNotice(notice)}

        {loading && snapshot == null ? (
          <AdminPanel title="加载中" description="正在读取站点设置和首页区块数据。">
            <div className="space-y-3 text-sm text-slate-500">
              <div className="h-4 w-1/3 rounded-full bg-slate-100" />
              <div className="h-4 w-2/3 rounded-full bg-slate-100" />
              <div className="h-4 w-1/2 rounded-full bg-slate-100" />
            </div>
          </AdminPanel>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {homeSettingGroups.map((group) => (
              <AdminPanel
                key={group.title}
                title={group.title}
                description={group.description}
                actions={
                  <button
                    className="admin-button-secondary px-3 py-1.5 text-xs"
                    onClick={() => void handleSaveSettings()}
                    disabled={loading || savingSettings}
                    type="button"
                  >
                    保存本组
                  </button>
                }
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  {group.fields.map((field) => (
                    <AdminField
                      key={field.key}
                      label={field.label}
                      hint={field.hint}
                      className={field.wide ? "lg:col-span-2" : ""}
                    >
                      {field.multiline ? (
                        <textarea
                          className={textAreaClassName}
                          rows={field.rows ?? 4}
                          placeholder={field.placeholder}
                          value={settingsForm[field.key] ?? ""}
                          onChange={(event) =>
                            setSettingsForm((current) => ({
                              ...current,
                              [field.key]: event.target.value
                            }))
                          }
                        />
                      ) : (
                        <input
                          className={inputClassName}
                          placeholder={field.placeholder}
                          value={settingsForm[field.key] ?? ""}
                          onChange={(event) =>
                            setSettingsForm((current) => ({
                              ...current,
                              [field.key]: event.target.value
                            }))
                          }
                        />
                      )}
                    </AdminField>
                  ))}
                </div>
              </AdminPanel>
            ))}

            <SectionEditorCard
              title="新增 / 更新区块"
              hint="使用同一个 sectionKey 反复保存即可更新。"
              sectionKey={newSectionKey}
              draft={newSectionDraft}
              onSectionKeyChange={setNewSectionKey}
              onDraftChange={(patch) => setNewSectionDraft((current) => ({ ...current, ...patch }))}
              onSave={async () => handleSaveSection(newSectionKey, newSectionDraft)}
              saving={savingSectionKey === newSectionKey.trim()}
            />

            <AdminPanel
              title="首页区块列表"
              description="首页区块列表,每一项都可以单独保存。"
              actions={
                <AdminStatusPill
                  status={sourcePill}
                  label={sourceLabel === "api" ? "在线" : sourceLabel === "partial" ? "部分" : "离线"}
                />
              }
            >
              {sections.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  当前还没有首页区块数据，可以先在上面的“新增 / 更新区块”里创建一条。
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section) => {
                    const draft = sectionDrafts[section.sectionKey] ?? createHomeSectionDraft(section);

                    return (
                      <HomeSectionCard
                        key={section.sectionKey}
                        section={section}
                        draft={draft}
                        onDraftChange={(patch) =>
                          setSectionDrafts((current) => ({
                            ...current,
                            [section.sectionKey]: {
                              ...(current[section.sectionKey] ?? createHomeSectionDraft(section)),
                              ...patch
                            }
                          }))
                        }
                        onSave={async () => handleSaveSection(section.sectionKey, draft)}
                        onDelete={async () => handleDeleteSection(section)}
                        saving={savingSectionKey === section.sectionKey}
                      />
                    );
                  })}
                </div>
              )}
            </AdminPanel>
          </div>

          <div className="space-y-6">
            <AdminPanel title="写入规则" description="页面表单值会保存。">
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li>站点设置保存到 home 配置组。</li>
                <li>首页区块保存到对应的区块配置。</li>
                <li>页面会自动带上当前管理员登录态。</li>
                <li>保存失败时会保留当前未保存内容，方便继续调整后再提交。</li>
              </ul>
            </AdminPanel>

            <AdminPanel title="当前未保存内容" description="这些内容会直接提交到 groupName=home 的站点设置。">
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                {homeSettingGroups.map((group) => (
                  <div key={group.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">{group.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                      {group.fields.map((field) => field.key).join(" / ")}
                    </p>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel title="区块建议" description="如果暂时没有区块，可以先按这些常用 key 创建。">
              <div className="flex flex-wrap gap-2">
                {sectionKeySuggestions.map((key) => (
                  <button
                    key={key}
                    className="admin-button-secondary px-3 py-1.5 text-xs"
                    onClick={() => setNewSectionKey(key)}
                    type="button"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
