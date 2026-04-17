"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPill } from "@/components/admin/admin-status-pill";
import {
  createContactFormState,
  createEmptyContactFormState,
  createAdminContact,
  deleteAdminContact,
  formatContactStatus,
  formatContactType,
  getContactStatusKey,
  loadAdminContacts,
  splitDisplayPlaces,
  type ContactFormState,
  type ContactListFilters,
  type ContactRecord,
  updateAdminContact,
  updateAdminContactSortOrder,
  updateAdminContactStatus
} from "@/lib/admin-contacts";

const CONTACT_TYPE_OPTIONS = [
  { label: "微信", value: "wechat" },
  { label: "QQ", value: "qq" },
  { label: "Telegram", value: "telegram" },
  { label: "邮箱", value: "email" },
  { label: "二维码", value: "qr" },
  { label: "跳转链接", value: "link" }
];

const STATUS_OPTIONS = [
  { label: "全部状态", value: "all" },
  { label: "启用", value: "1" },
  { label: "停用", value: "0" }
];

const TYPE_OPTIONS = [{ label: "全部类型", value: "all" }, ...CONTACT_TYPE_OPTIONS];

const DISPLAY_PLACE_HINT = "home,product,detail,footer";

function formatDateTime(value: string) {
  return value.replace("T", " ").slice(0, 19);
}

function getContactSortValue(contact: ContactRecord) {
  return contact.sortOrder ?? 0;
}

function toSortDrafts(records: ContactRecord[]) {
  return records.reduce<Record<number, string>>((accumulator, record) => {
    accumulator[record.id] = String(record.sortOrder ?? 0);
    return accumulator;
  }, {});
}

function matchesContact(contact: ContactRecord, filters: ContactListFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  const keywordMatches =
    keyword.length === 0 ||
    [contact.name, contact.value, contact.type, contact.qrImage, contact.jumpUrl, contact.displayPlaces]
      .filter(Boolean)
      .some((item) => String(item).toLowerCase().includes(keyword));

  const typeMatches = filters.type === "all" || (contact.type ?? "") === filters.type;
  const statusMatches =
    filters.status === "all" ||
    String(contact.status ?? 0) === filters.status ||
    (filters.status === "1" && contact.status === 1) ||
    (filters.status === "0" && contact.status === 0);

  return keywordMatches && typeMatches && statusMatches;
}

function buildContactPreview(contact: ContactFormState) {
  return {
    type: formatContactType(contact.type),
    name: contact.name.trim() || "未命名渠道",
    value: contact.value.trim() || "未填写",
    status: contact.status === "1" ? "enabled" : "disabled",
    statusLabel: formatContactStatus(contact.status === "1" ? 1 : 0),
    places: splitDisplayPlaces(contact.displayPlaces)
  };
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [filters, setFilters] = useState<ContactListFilters>({
    keyword: "",
    type: "all",
    status: "all"
  });
  const [formState, setFormState] = useState<ContactFormState>(createEmptyContactFormState());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortDrafts, setSortDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error" | "info"; message: string } | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts
      .slice()
      .sort((left, right) => getContactSortValue(left) - getContactSortValue(right) || left.id - right.id)
      .filter((contact) => matchesContact(contact, filters));
  }, [contacts, filters]);

  const metrics = useMemo(() => {
    const total = contacts.length;
    const enabled = contacts.filter((contact) => contact.status === 1).length;
    const disabled = contacts.filter((contact) => contact.status === 0).length;
    const pending = contacts.filter((contact) => contact.status == null).length;

    return { total, enabled, disabled, pending };
  }, [contacts]);

  async function refreshContacts(nextSelectionId?: number | null) {
    const response = await loadAdminContacts();
    const nextContacts = response.contacts;

    setContacts(nextContacts);
    setSortDrafts(toSortDrafts(nextContacts));

    const selectionId = nextSelectionId === undefined ? editingId : nextSelectionId;
    if (selectionId == null) {
      setEditingId(null);
      setFormState(createEmptyContactFormState());
      return;
    }

    const nextSelected = nextContacts.find((contact) => contact.id === selectionId);
    if (nextSelected) {
      setEditingId(nextSelected.id);
      setFormState(createContactFormState(nextSelected));
      return;
    }

    setEditingId(null);
    setFormState(createEmptyContactFormState());
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        await refreshContacts(null);
        if (!cancelled) {
          setNotice({ kind: "info", message: "联系人列表已加载真实接口数据。" });
        }
      } catch (exception) {
        if (!cancelled) {
          const message = exception instanceof Error ? exception.message : "联系人列表加载失败";
          setError(message);
          setNotice({ kind: "error", message });
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

  function startCreate() {
    setEditingId(null);
    setFormState(createEmptyContactFormState());
    setError(null);
    setNotice(null);
  }

  function startEdit(contact: ContactRecord) {
    setEditingId(contact.id);
    setFormState(createContactFormState(contact));
    setError(null);
    setNotice(null);
  }

  function handleFormChange<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setFormState((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const saved = editingId == null ? await createAdminContact(formState) : await updateAdminContact(editingId, formState);
      setNotice({
        kind: "success",
        message: editingId == null ? `已创建联系人「${saved.name}」` : `已更新联系人「${saved.name}」`
      });
      await refreshContacts(saved.id);
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : "联系人保存失败";
      setError(message);
      setNotice({ kind: "error", message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(contact: ContactRecord) {
    const confirmed = window.confirm(`确认删除联系人「${contact.name}」吗？此操作不可恢复。`);
    if (!confirmed) {
      return;
    }

    setBusyKey(`delete-${contact.id}`);
    setError(null);
    setNotice(null);

    try {
      await deleteAdminContact(contact.id);
      setNotice({ kind: "success", message: `已删除联系人「${contact.name}」` });
      if (editingId === contact.id) {
        setEditingId(null);
        setFormState(createEmptyContactFormState());
      }
      await refreshContacts(editingId === contact.id ? null : editingId);
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : "联系人删除失败";
      setError(message);
      setNotice({ kind: "error", message });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleToggleStatus(contact: ContactRecord) {
    const nextStatus = contact.status === 1 ? 0 : 1;
    setBusyKey(`status-${contact.id}`);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateAdminContactStatus(contact.id, nextStatus);
      setNotice({
        kind: "success",
        message: `已${nextStatus === 1 ? "启用" : "停用"}联系人「${updated.name}」`
      });
      await refreshContacts(editingId);
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : "状态更新失败";
      setError(message);
      setNotice({ kind: "error", message });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSaveSort(contact: ContactRecord) {
    const sortValue = sortDrafts[contact.id] ?? "";
    const sortOrder = Number.parseInt(sortValue.trim(), 10);

    if (Number.isNaN(sortOrder)) {
      setError("请输入有效的排序值");
      setNotice({ kind: "error", message: "请输入有效的排序值" });
      return;
    }

    setBusyKey(`sort-${contact.id}`);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateAdminContactSortOrder(contact.id, sortOrder);
      setNotice({
        kind: "success",
        message: `已更新联系人「${updated.name}」的排序值`
      });
      await refreshContacts(editingId);
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : "排序更新失败";
      setError(message);
      setNotice({ kind: "error", message });
    } finally {
      setBusyKey(null);
    }
  }

  const selectedPreview = buildContactPreview(formState);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin / Contacts"
          title="联系方式管理真实联调"
          description="真实读取并维护联系方式渠道，支持筛选、创建、编辑、删除、启停和排序更新。"
          actions={
            <>
              <button
                type="button"
                onClick={() => void refreshContacts(editingId)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                刷新列表
              </button>
              <button
                type="button"
                onClick={startCreate}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
              >
                新建渠道
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          <AdminMetricCard label="渠道总数" value={String(metrics.total)} hint="来自 /api/contacts 的真实结果" accent="cyan" />
          <AdminMetricCard label="已启用" value={String(metrics.enabled)} hint="status = 1 的渠道数量" accent="emerald" />
          <AdminMetricCard label="已停用" value={String(metrics.disabled)} hint="status = 0 的渠道数量" accent="amber" />
          <AdminMetricCard label="待确认" value={String(metrics.pending)} hint="status 为空时的兼容统计" accent="violet" />
        </div>

        {notice ? (
          <div
            className={[
              "rounded-2xl border px-4 py-3 text-sm",
              notice.kind === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                : notice.kind === "error"
                  ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
                  : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
            ].join(" ")}
          >
            {notice.message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <AdminPanel
            title="联系人列表"
            description="前台会读取这张真实表，筛选条件仅影响当前页面显示，不改动后端数据。"
            actions={
              <>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      keyword: "",
                      type: "all",
                      status: "all"
                    })
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                >
                  清空筛选
                </button>
              </>
            }
          >
            <div className="mb-4 grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
              <AdminField label="关键词" hint="按名称、值、跳转链接或备注模糊搜索">
                <input
                  value={filters.keyword}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      keyword: event.target.value
                    }))
                  }
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="输入名称、账号、链接关键词"
                />
              </AdminField>
              <AdminField label="类型" hint="用于快速查看不同渠道">
                <select
                  value={filters.type}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      type: event.target.value
                    }))
                  }
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="状态" hint="只看启用或停用的联系人">
                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value
                    }))
                  }
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">联系人</th>
                    <th className="px-4 py-3 font-medium">类型</th>
                    <th className="px-4 py-3 font-medium">值</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-4 py-3 font-medium">排序</th>
                    <th className="px-4 py-3 font-medium">更新时间</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                        正在加载真实联系人数据...
                      </td>
                    </tr>
                  ) : filteredContacts.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                        当前没有符合筛选条件的联系人。
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => {
                      const statusKey = getContactStatusKey(contact.status);
                      const isBusy = busyKey === `status-${contact.id}` || busyKey === `sort-${contact.id}` || busyKey === `delete-${contact.id}`;
                      const places = splitDisplayPlaces(contact.displayPlaces);

                      return (
                        <tr key={contact.id} className="bg-slate-950/40 align-top">
                          <td className="px-4 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white">{contact.name}</p>
                                <AdminStatusPill status={statusKey} label={formatContactStatus(contact.status)} />
                              </div>
                              <p className="text-xs leading-5 text-slate-500">ID: {contact.id}</p>
                              <div className="flex flex-wrap gap-2">
                                {places.map((place) => (
                                  <span key={place} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                                    {place}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-300">{formatContactType(contact.type)}</td>
                          <td className="px-4 py-4">
                            <div className="space-y-2 text-slate-200">
                              <p className="break-all">{contact.value}</p>
                              {contact.jumpUrl ? <p className="break-all text-xs text-cyan-200/80">{contact.jumpUrl}</p> : null}
                              {contact.qrImage ? <p className="break-all text-xs text-slate-500">{contact.qrImage}</p> : null}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => void handleToggleStatus(contact)}
                              disabled={isBusy}
                              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {busyKey === `status-${contact.id}` ? "切换中..." : formatContactStatus(contact.status)}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={sortDrafts[contact.id] ?? String(contact.sortOrder ?? 0)}
                                onChange={(event) =>
                                  setSortDrafts((current) => ({
                                    ...current,
                                    [contact.id]: event.target.value
                                  }))
                                }
                                className="w-20 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => void handleSaveSort(contact)}
                                disabled={isBusy}
                                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {busyKey === `sort-${contact.id}` ? "保存中..." : "保存排序"}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-400">{formatDateTime(contact.updatedAt)}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(contact)}
                                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(contact)}
                                disabled={isBusy}
                                className="rounded-full border border-rose-400/30 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {busyKey === `delete-${contact.id}` ? "删除中..." : "删除"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </AdminPanel>

          <div className="space-y-4">
            <AdminPanel
              title={editingId == null ? "新建联系人" : `编辑联系人 #${editingId}`}
              description="先把表单字段和接口对齐，保存后会立即回刷列表。"
            >
              <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="类型" required hint="与后端 ContactRequest.type 对齐">
                    <select
                      value={formState.type}
                      onChange={(event) => handleFormChange("type", event.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                      required
                    >
                      {CONTACT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="状态" required hint="1 = 启用，0 = 停用">
                    <select
                      value={formState.status}
                      onChange={(event) => handleFormChange("status", event.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                      required
                    >
                      <option value="1">启用</option>
                      <option value="0">停用</option>
                    </select>
                  </AdminField>
                </div>

                <AdminField label="名称" required hint="例如：微信客服、Telegram 频道、二维码入口">
                  <input
                    value={formState.name}
                    onChange={(event) => handleFormChange("name", event.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="请输入联系人名称"
                    required
                  />
                </AdminField>

                <AdminField label="值" required hint="账号、号码、链接文本，或其它前台要展示的值">
                  <textarea
                    value={formState.value}
                    onChange={(event) => handleFormChange("value", event.target.value)}
                    className="min-h-[92px] rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="请输入联系方式值"
                    required
                  />
                </AdminField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="二维码图片" hint="可上传图片或填写图片地址">
                    <div className="space-y-2">
                      <input
                        value={formState.qrImage}
                        onChange={(event) => handleFormChange("qrImage", event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                        placeholder="https://..."
                      />
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                              const response = await fetch("/api/upload", {
                                method: "POST",
                                body: formData
                              });

                              if (!response.ok) {
                                throw new Error("上传失败");
                              }

                              const data = await response.json();
                              handleFormChange("qrImage", data.url);
                            } catch (error) {
                              alert(error instanceof Error ? error.message : "上传失败");
                            }
                          }}
                        />
                        <span>📤</span>
                        <span>点击上传图片</span>
                      </label>
                    </div>
                  </AdminField>
                  <AdminField label="跳转链接" hint="可用于按钮跳转、外链或私聊入口">
                    <input
                      value={formState.jumpUrl}
                      onChange={(event) => handleFormChange("jumpUrl", event.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="https://t.me/..."
                    />
                  </AdminField>
                </div>

                <AdminField label="展示位置" hint={`逗号分隔，例如 ${DISPLAY_PLACE_HINT}`}>
                  <input
                    value={formState.displayPlaces}
                    onChange={(event) => handleFormChange("displayPlaces", event.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="home,product,detail"
                  />
                </AdminField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="排序值" hint="越小越靠前">
                    <input
                      type="number"
                      value={formState.sortOrder}
                      onChange={(event) => handleFormChange("sortOrder", event.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="0"
                    />
                  </AdminField>
                  <AdminField label="当前状态预览" hint="保存前可快速确认">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
                      {selectedPreview.statusLabel}
                    </div>
                  </AdminField>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "保存中..." : editingId == null ? "创建联系人" : "保存修改"}
                  </button>
                  <button
                    type="button"
                    onClick={startCreate}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    清空表单
                  </button>
                </div>
              </form>
            </AdminPanel>

            <AdminPanel title="表单预览" description="右侧区域直接展示当前编辑内容的前台形态。">
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">渠道名称</p>
                      <h3 className="mt-1 text-xl font-semibold text-white">{selectedPreview.name}</h3>
                    </div>
                    <AdminStatusPill status={selectedPreview.status} label={selectedPreview.statusLabel} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{selectedPreview.value}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedPreview.places.length > 0 ? (
                      selectedPreview.places.map((place) => (
                        <span key={place} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                          {place}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">尚未设置展示位置</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-sm text-slate-400">类型</p>
                    <p className="mt-2 text-lg font-semibold text-white">{selectedPreview.type}</p>
                    <p className="mt-2 text-xs text-slate-500">实际保存字段：type / name / value / qrImage / jumpUrl / displayPlaces / sortOrder / status</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-sm text-slate-400">二维码预览</p>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-white/10 bg-slate-900/70">
                      {formState.qrImage ? (
                        <img src={formState.qrImage} alt={selectedPreview.name} className="h-40 w-full object-cover" />
                      ) : (
                        <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-slate-500">
                          填入二维码图片地址后，这里会显示预览。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
