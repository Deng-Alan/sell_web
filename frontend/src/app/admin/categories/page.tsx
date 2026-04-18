"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPill } from "@/components/admin/admin-status-pill";
import {
  createAdminCategoryFormState,
  createEmptyAdminCategoryFormState,
  deleteAdminCategory,
  formatAdminCategoryDateTime,
  getCategoryStatusLabel,
  loadAdminCategories,
  saveAdminCategory,
  updateAdminCategorySort,
  updateAdminCategoryStatus,
  type AdminCategoryFormState
} from "@/lib/admin-categories";
import type { AdminCategoryRecord } from "@/types/catalog";

type CategoryFilterStatus = "all" | "enabled" | "disabled";

function getStatusValue(record: AdminCategoryRecord) {
  return record.status === 1 ? "enabled" : "disabled";
}

function matchesKeyword(record: AdminCategoryRecord, keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return record.name.toLowerCase().includes(normalized) || record.slug.toLowerCase().includes(normalized);
}

function sortCategories(records: AdminCategoryRecord[]) {
  return records
    .slice()
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.id - right.id);
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<CategoryFilterStatus>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<AdminCategoryFormState>(createEmptyAdminCategoryFormState());
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sortDrafts, setSortDrafts] = useState<Record<string, string>>({});

  const visibleCategories = useMemo(() => {
    return sortCategories(categories).filter((record) => {
      const statusMatched = statusFilter === "all" ? true : statusFilter === getStatusValue(record);
      return statusMatched && matchesKeyword(record, keyword);
    });
  }, [categories, keyword, statusFilter]);

  const metrics = useMemo(() => {
    const total = categories.length;
    const enabled = categories.filter((record) => record.status === 1).length;
    const disabled = total - enabled;

    return { total, enabled, disabled };
  }, [categories]);

  async function reloadCategories(options?: { preserveEditor?: boolean; editorId?: string | null }) {
    const preserveEditor = options?.preserveEditor ?? false;
    const editorId = options?.editorId ?? editingId;

    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await loadAdminCategories();
      const nextCategories = sortCategories(result.categories);
      setCategories(nextCategories);
      setLoadError(result.error);
      setSortDrafts(Object.fromEntries(nextCategories.map((record) => [String(record.id), String(record.sortOrder ?? 0)])));

      if (preserveEditor && editorId) {
        const refreshed = nextCategories.find((record) => String(record.id) === editorId);
        if (refreshed) {
          setFormState(createAdminCategoryFormState(refreshed));
        }
      } else if (!preserveEditor) {
        setEditingId(null);
        setFormState(createEmptyAdminCategoryFormState());
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "分类加载失败");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void reloadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function beginCreate() {
    setEditingId(null);
    setFormError(null);
    setNotice(null);
    setFormState(createEmptyAdminCategoryFormState());
  }

  function beginEdit(record: AdminCategoryRecord) {
    setEditingId(String(record.id));
    setFormError(null);
    setNotice(null);
    setFormState(createAdminCategoryFormState(record));
  }

  async function handleSubmit() {
    setIsSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      const mode = editingId ? "edit" : "create";
      await saveAdminCategory(mode, editingId, formState);
      setNotice(mode === "create" ? "分类已创建。" : "分类已保存。");
      setEditingId(null);
      setFormState(createEmptyAdminCategoryFormState());
      await reloadCategories({ preserveEditor: false });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "分类保存失败");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: AdminCategoryRecord) {
    const confirmed = window.confirm(`确认删除分类「${record.name}」吗？此操作不可恢复。`);
    if (!confirmed) {
      return;
    }

    setActiveActionId(`delete:${record.id}`);
    setNotice(null);
    setFormError(null);

    try {
      await deleteAdminCategory(String(record.id));
      setNotice("分类已删除。");
      if (editingId === String(record.id)) {
        setEditingId(null);
        setFormState(createEmptyAdminCategoryFormState());
      }
      await reloadCategories({ preserveEditor: false });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "分类删除失败");
    } finally {
      setActiveActionId(null);
    }
  }

  async function handleStatusToggle(record: AdminCategoryRecord) {
    const nextStatus = record.status === 1 ? 0 : 1;
    setActiveActionId(`status:${record.id}`);
    setNotice(null);
    setFormError(null);

    try {
      await updateAdminCategoryStatus(String(record.id), nextStatus);
      setNotice(nextStatus === 1 ? "分类已启用。" : "分类已停用。");
      await reloadCategories({ preserveEditor: editingId === String(record.id), editorId: String(record.id) });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "分类状态更新失败");
    } finally {
      setActiveActionId(null);
    }
  }

  async function handleSortSave(record: AdminCategoryRecord) {
    const draft = sortDrafts[String(record.id)] ?? String(record.sortOrder ?? 0);
    const nextSort = Number.parseInt(draft, 10);
    if (Number.isNaN(nextSort) || nextSort < 0) {
      setFormError("排序值必须是大于等于 0 的整数。");
      return;
    }

    setActiveActionId(`sort:${record.id}`);
    setNotice(null);
    setFormError(null);

    try {
      await updateAdminCategorySort(String(record.id), nextSort);
      setNotice("分类排序已更新。");
      await reloadCategories({ preserveEditor: editingId === String(record.id), editorId: String(record.id) });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "分类排序更新失败");
    } finally {
      setActiveActionId(null);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="内容管理 / 分类"
          title="分类管理"
          description="维护前台商品分类，支持新建、编辑、启停和排序。"
          actions={
            <>
              <button className="admin-button-secondary" onClick={() => void reloadCategories({ preserveEditor: true })} type="button">
                刷新
              </button>
              <button className="admin-button-primary" onClick={beginCreate} type="button">
                新建分类
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <AdminMetricCard label="分类总数" value={String(metrics.total)} hint="当前后台分类数量" accent="cyan" />
          <AdminMetricCard label="已启用" value={String(metrics.enabled)} hint="会展示到前台" accent="emerald" />
          <AdminMetricCard label="已停用" value={String(metrics.disabled)} hint="后台保留但前台隐藏" accent="amber" />
        </div>

        {loadError ? <AdminNotice tone="error" message={`分类数据加载失败：${loadError}`} /> : null}
        {notice ? <AdminNotice tone="success" message={notice} /> : null}
        {formError ? <AdminNotice tone="error" message={formError} /> : null}

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <AdminPanel
            title="分类列表"
            description="通过关键词和状态快速定位分类。"
            actions={
              <>
                <button className="admin-button-secondary px-3 py-1.5 text-xs" onClick={() => setKeyword("")} type="button">
                  清空搜索
                </button>
                <button className="admin-button-secondary px-3 py-1.5 text-xs" onClick={() => setStatusFilter("all")} type="button">
                  全部状态
                </button>
              </>
            }
          >
            <div className="mb-4 grid gap-3 sm:grid-cols-[1.4fr_0.8fr]">
              <AdminField label="关键词" hint="按名称或标识搜索">
                <input
                  className="admin-input"
                  placeholder="输入分类名称或标识"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </AdminField>
              <AdminField label="状态" hint="筛选列表">
                <select className="admin-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CategoryFilterStatus)}>
                  <option value="all">全部</option>
                  <option value="enabled">已启用</option>
                  <option value="disabled">已停用</option>
                </select>
              </AdminField>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : visibleCategories.length > 0 ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>分类</th>
                      <th>标识</th>
                      <th>排序</th>
                      <th>状态</th>
                      <th>更新时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCategories.map((record) => {
                      const rowStatus = getStatusValue(record);
                      const sortDraft = sortDrafts[String(record.id)] ?? String(record.sortOrder ?? 0);
                      const busy =
                        activeActionId === `delete:${record.id}` ||
                        activeActionId === `status:${record.id}` ||
                        activeActionId === `sort:${record.id}`;

                      return (
                        <tr key={record.id}>
                          <td>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{record.name}</p>
                              <p className="text-xs text-slate-500">ID #{record.id}</p>
                            </div>
                          </td>
                          <td className="text-slate-600">{record.slug}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <input
                                className="admin-input w-24 py-2"
                                type="number"
                                min={0}
                                value={sortDraft}
                                onChange={(event) =>
                                  setSortDrafts((current) => ({
                                    ...current,
                                    [String(record.id)]: event.target.value
                                  }))
                                }
                              />
                              <button
                                className="admin-button-secondary px-3 py-1.5 text-xs"
                                onClick={() => void handleSortSave(record)}
                                disabled={busy}
                                type="button"
                              >
                                {activeActionId === `sort:${record.id}` ? "保存中" : "保存"}
                              </button>
                            </div>
                          </td>
                          <td>
                            <AdminStatusPill status={rowStatus} label={getCategoryStatusLabel(record.status)} />
                          </td>
                          <td className="text-slate-500">{formatAdminCategoryDateTime(record.updatedAt)}</td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              <button className="admin-button-secondary px-3 py-1.5 text-xs" onClick={() => beginEdit(record)} type="button">
                                编辑
                              </button>
                              <button
                                className="admin-button-secondary px-3 py-1.5 text-xs"
                                onClick={() => void handleStatusToggle(record)}
                                disabled={busy}
                                type="button"
                              >
                                {activeActionId === `status:${record.id}` ? "更新中" : record.status === 1 ? "停用" : "启用"}
                              </button>
                              <button
                                className="admin-button-danger px-3 py-1.5 text-xs"
                                onClick={() => void handleDelete(record)}
                                disabled={busy}
                                type="button"
                              >
                                {activeActionId === `delete:${record.id}` ? "删除中" : "删除"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <AdminEmptyState
                title="没有分类数据"
                description="当前没有符合条件的分类。可以清空筛选，或先新建一个商品分类。"
                action={
                  <button className="admin-button-primary" onClick={beginCreate} type="button">
                    新建分类
                  </button>
                }
              />
            )}
          </AdminPanel>

          <div className="space-y-4">
            <AdminPanel
              title={editingId ? "编辑分类" : "新建分类"}
              description="分类保存后会自动刷新列表。"
              actions={
                <>
                  <button className="admin-button-secondary px-3 py-1.5 text-xs" onClick={beginCreate} type="button">
                    清空表单
                  </button>
                  {editingId ? (
                    <button className="admin-button-secondary px-3 py-1.5 text-xs" onClick={beginCreate} type="button">
                      退出编辑
                    </button>
                  ) : null}
                </>
              }
            >
              <div className="space-y-4">
                <AdminField label="名称" hint="分类显示名称。" required>
                  <input
                    className="admin-input"
                    placeholder="邮箱账号"
                    value={formState.name}
                    onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                  />
                </AdminField>

                <AdminField label="标识" hint="仅允许小写字母、数字和连字符。" required>
                  <input
                    className="admin-input"
                    placeholder="mail-accounts"
                    value={formState.slug}
                    onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value }))}
                  />
                </AdminField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="排序值" hint="数字越小越靠前。">
                    <input
                      className="admin-input"
                      type="number"
                      min={0}
                      value={formState.sortOrder}
                      onChange={(event) => setFormState((current) => ({ ...current, sortOrder: event.target.value }))}
                    />
                  </AdminField>

                  <AdminField label="状态" hint="控制前台可见性。">
                    <select
                      className="admin-select"
                      value={formState.status}
                      onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))}
                    >
                      <option value="1">已启用</option>
                      <option value="0">已停用</option>
                    </select>
                  </AdminField>
                </div>

                <div className="admin-subtle-card grid gap-3 p-4 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>当前状态</span>
                    <AdminStatusPill status={formState.status === "1" ? "enabled" : "disabled"} label={getCategoryStatusLabel(Number(formState.status) as 0 | 1)} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>操作模式</span>
                    <span className="font-medium text-slate-900">{editingId ? "编辑已有分类" : "创建新分类"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button className="admin-button-primary" onClick={() => void handleSubmit()} disabled={isSaving} type="button">
                    {isSaving ? "保存中..." : editingId ? "更新分类" : "创建分类"}
                  </button>
                  <button className="admin-button-secondary" onClick={beginCreate} type="button">
                    重置
                  </button>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="操作说明" description="分类会影响前台商品筛选和商品归属。">
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li>分类标识建议保持稳定，避免频繁修改。</li>
                <li>停用分类后，前台不再展示该分类入口。</li>
                <li>排序值越小越靠前，适合控制前台分类顺序。</li>
              </ul>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
