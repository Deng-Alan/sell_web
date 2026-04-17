"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPill } from "@/components/admin/admin-status-pill";
import type { AdminCategoryRecord } from "@/types/catalog";
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
  type AdminCategoryFormState,
  type AdminCategoryLoadResult
} from "@/lib/admin-categories";

type CategoryFilterStatus = "all" | "enabled" | "disabled";

function getStatusValue(record: AdminCategoryRecord) {
  return record.status === 1 ? "enabled" : "disabled";
}

function matchesKeyword(record: AdminCategoryRecord, keyword: string) {
  if (!keyword) {
    return true;
  }

  const normalized = keyword.trim().toLowerCase();
  return record.name.toLowerCase().includes(normalized) || record.slug.toLowerCase().includes(normalized);
}

function sortCategories(records: AdminCategoryRecord[]) {
  return records
    .slice()
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.id - right.id);
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [source, setSource] = useState<AdminCategoryLoadResult["source"]>("fallback");
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
      const statusValue = getStatusValue(record);
      const statusMatched = statusFilter === "all" ? true : statusFilter === statusValue;
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
      setSource(result.source);
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
      setLoadError(error instanceof Error ? error.message : "Failed to load categories");
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
      setNotice(mode === "create" ? "Category created" : "Category updated");
      setEditingId(null);
      setFormState(createEmptyAdminCategoryFormState());
      await reloadCategories({ preserveEditor: false });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: AdminCategoryRecord) {
    const confirmed = window.confirm(`Delete category "${record.name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setActiveActionId(`delete:${record.id}`);
    setNotice(null);
    setFormError(null);

    try {
      await deleteAdminCategory(String(record.id));
      setNotice("Category deleted");
      if (editingId === String(record.id)) {
        setEditingId(null);
        setFormState(createEmptyAdminCategoryFormState());
      }
      await reloadCategories({ preserveEditor: false });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Delete failed");
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
      setNotice(nextStatus === 1 ? "Category enabled" : "Category disabled");
      await reloadCategories({ preserveEditor: editingId === String(record.id), editorId: String(record.id) });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Status update failed");
    } finally {
      setActiveActionId(null);
    }
  }

  async function handleSortSave(record: AdminCategoryRecord) {
    const draft = sortDrafts[String(record.id)] ?? String(record.sortOrder ?? 0);
    const nextSort = Number.parseInt(draft, 10);
    if (Number.isNaN(nextSort) || nextSort < 0) {
      setFormError("Sort order must be an integer greater than or equal to 0");
      return;
    }

    setActiveActionId(`sort:${record.id}`);
    setNotice(null);
    setFormError(null);

    try {
      await updateAdminCategorySort(String(record.id), nextSort);
      setNotice("Sort order updated");
      await reloadCategories({ preserveEditor: editingId === String(record.id), editorId: String(record.id) });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Sort update failed");
    } finally {
      setActiveActionId(null);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin / Categories"
          title="Category Management"
          description="This page is connected to the real category API and supports loading, filtering, create, edit, delete, enable/disable, and sort order updates."
          actions={
            <>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                onClick={() => void reloadCategories({ preserveEditor: true })}
                type="button"
              >
                Refresh
              </button>
              <button
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
                onClick={beginCreate}
                type="button"
              >
                New Category
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <AdminMetricCard label="Total Categories" value={String(metrics.total)} hint="From the API or fallback data" accent="cyan" />
          <AdminMetricCard label="Enabled" value={String(metrics.enabled)} hint="Visible in the public UI" accent="emerald" />
          <AdminMetricCard label="Disabled" value={String(metrics.disabled)} hint="Hidden or reserved" accent="amber" />
        </div>

        {loadError ? (
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
            API unavailable. Showing local fallback data: {loadError}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-100">
            {notice}
          </div>
        ) : null}

        {formError ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
            {formError}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <AdminPanel
            title="Category List"
            description="Basic filtering and row-level sort updates are wired to the real API."
            actions={
              <>
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                  onClick={() => setKeyword("")}
                  type="button"
                >
                  Clear Search
                </button>
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                  onClick={() => setStatusFilter("all")}
                  type="button"
                >
                  All Status
                </button>
              </>
            }
          >
            <div className="mb-4 grid gap-3 sm:grid-cols-[1.4fr_0.8fr]">
              <AdminField label="Keyword" hint="Search by name or slug">
                <input
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="mail-accounts"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </AdminField>
              <AdminField label="Status" hint="Filter the list">
                <select
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as CategoryFilterStatus)}
                >
                  <option value="all">All</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </AdminField>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Sort</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <tr key={`loading-${index}`} className="bg-slate-950/40">
                        <td className="px-4 py-4" colSpan={6}>
                          <div className="h-5 w-full animate-pulse rounded-full bg-white/8" />
                        </td>
                      </tr>
                    ))
                  ) : visibleCategories.length > 0 ? (
                    visibleCategories.map((record) => {
                      const rowStatus = getStatusValue(record);
                      const sortDraft = sortDrafts[String(record.id)] ?? String(record.sortOrder ?? 0);
                      const busy = activeActionId === `delete:${record.id}` || activeActionId === `status:${record.id}` || activeActionId === `sort:${record.id}`;

                      return (
                        <tr key={record.id} className="bg-slate-950/40">
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <p className="font-medium text-white">{record.name}</p>
                              <p className="text-xs text-slate-500">ID #{record.id}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-300">{record.slug}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                className="w-24 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
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
                                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => void handleSortSave(record)}
                                disabled={busy}
                                type="button"
                              >
                                {activeActionId === `sort:${record.id}` ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <AdminStatusPill status={rowStatus} label={getCategoryStatusLabel(record.status)} />
                          </td>
                          <td className="px-4 py-4 text-slate-400">{formatAdminCategoryDateTime(record.updatedAt)}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                                onClick={() => beginEdit(record)}
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => void handleStatusToggle(record)}
                                disabled={busy}
                                type="button"
                              >
                                {activeActionId === `status:${record.id}` ? "Updating..." : record.status === 1 ? "Disable" : "Enable"}
                              </button>
                              <button
                                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-rose-200 transition hover:border-rose-400/40 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => void handleDelete(record)}
                                disabled={busy}
                                type="button"
                              >
                                {activeActionId === `delete:${record.id}` ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="bg-slate-950/40">
                      <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={6}>
                        No categories match the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AdminPanel>

          <div className="space-y-4">
            <AdminPanel
              title={editingId ? "Edit Category" : "New Category"}
              description="The form is connected to the real API. After submit, the list will refresh."
              actions={
                <>
                  <button
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                    onClick={beginCreate}
                    type="button"
                  >
                    Clear Form
                  </button>
                  {editingId ? (
                    <button
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                      onClick={beginCreate}
                      type="button"
                    >
                      Exit Edit
                    </button>
                  ) : null}
                </>
              }
            >
              <div className="space-y-4">
                <AdminField label="Name" hint="Category display name" required>
                  <input
                    className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="Mail Accounts"
                    value={formState.name}
                    onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                  />
                </AdminField>

                <AdminField label="Slug" hint="Lowercase letters, numbers, and hyphens only" required>
                  <input
                    className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="mail-accounts"
                    value={formState.slug}
                    onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value }))}
                  />
                </AdminField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Sort Order" hint="Smaller numbers appear first">
                    <input
                      className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      type="number"
                      min={0}
                      value={formState.sortOrder}
                      onChange={(event) => setFormState((current) => ({ ...current, sortOrder: event.target.value }))}
                    />
                  </AdminField>

                  <AdminField label="Status" hint="Control public visibility">
                    <select
                      className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                      value={formState.status}
                      onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))}
                    >
                      <option value="1">Enabled</option>
                      <option value="0">Disabled</option>
                    </select>
                  </AdminField>
                </div>

                <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Source</span>
                    <span className="text-slate-100">{source === "api" ? "API" : "Fallback"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Current Status</span>
                    <span className="text-slate-100">{getCategoryStatusLabel(Number(formState.status) as 0 | 1)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void handleSubmit()}
                    disabled={isSaving}
                    type="button"
                  >
                    {isSaving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
                  </button>
                  <button
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                    onClick={beginCreate}
                    type="button"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="API Notes" description="This page is wired to the real category endpoints.">
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                <li>GET /api/categories - load category list.</li>
                <li>POST /api/categories - create category.</li>
                <li>PUT /api/categories/{`{id}`} - update category.</li>
                <li>DELETE /api/categories/{`{id}`} - delete category.</li>
                <li>PUT /api/categories/{`{id}`}/status - enable or disable category.</li>
                <li>PUT /api/categories/{`{id}`}/sort - update category sort order.</li>
              </ul>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
