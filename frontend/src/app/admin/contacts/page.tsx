"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminNotice } from "@/components/admin/admin-notice";
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
import { uploadAdminImage } from "@/lib/admin-upload";

const CONTACT_TYPE_OPTIONS = [
  { label: "微信", value: "wechat" },
  { label: "QQ", value: "qq" },
  { label: "电话", value: "phone" },
  { label: "Telegram", value: "telegram" },
  { label: "邮箱", value: "email" },
  { label: "网站", value: "website" },
  { label: "二维码", value: "qr" },
  { label: "跳转链接", value: "link" },
  { label: "其他", value: "other" }
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
  const [uploadingQr, setUploadingQr] = useState(false);
  const qrUploadInputRef = useRef<HTMLInputElement | null>(null);

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
    const qrEnabled = contacts.filter((contact) => Boolean(contact.qrImage)).length;

    return { total, enabled, disabled, qrEnabled };
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
          setNotice({ kind: "info", message: "联系人列表已加载。" });
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

  async function handleQrUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    setUploadingQr(true);
    setError(null);

    try {
      const uploaded = await uploadAdminImage(file);
      handleFormChange("qrImage", uploaded.url);
      setNotice({ kind: "success", message: "二维码图片已上传。" });
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : "二维码上传失败";
      setError(message);
      setNotice({ kind: "error", message });
    } finally {
      setUploadingQr(false);
      if (qrUploadInputRef.current) {
        qrUploadInputRef.current.value = "";
      }
    }
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
      setError("请输入有效的排序值。");
      setNotice({ kind: "error", message: "请输入有效的排序值。" });
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
          eyebrow="内容管理 / 联系方式"
          title="联系方式管理"
          description="维护咨询渠道、二维码和外链入口，并控制展示位置。"
          actions={
            <>
              <button type="button" onClick={() => void refreshContacts(editingId)} className="admin-button-secondary">
                刷新列表
              </button>
              <button type="button" onClick={startCreate} className="admin-button-primary">
                新建渠道
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          <AdminMetricCard label="渠道总数" value={String(metrics.total)} hint="全部联系方式渠道" accent="cyan" />
          <AdminMetricCard label="已启用" value={String(metrics.enabled)} hint="当前对前台可见" accent="emerald" />
          <AdminMetricCard label="已停用" value={String(metrics.disabled)} hint="已隐藏或暂存" accent="amber" />
          <AdminMetricCard label="带二维码" value={String(metrics.qrEnabled)} hint="已配置二维码图片" accent="violet" />
        </div>

        {notice ? <AdminNotice tone={notice.kind === "info" ? "info" : notice.kind} message={notice.message} /> : null}
        {error ? <AdminNotice tone="error" message={error} /> : null}

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <AdminPanel
            title="联系人列表"
            description="支持按关键词、类型和状态筛选。"
            actions={
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    keyword: "",
                    type: "all",
                    status: "all"
                  })
                }
                className="admin-button-secondary px-3 py-1.5 text-xs"
              >
                清空筛选
              </button>
            }
          >
            <div className="mb-4 grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
              <AdminField label="关键词" hint="按名称、值或链接搜索">
                <input
                  value={filters.keyword}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      keyword: event.target.value
                    }))
                  }
                  className="admin-input"
                  placeholder="输入名称、账号或链接关键词"
                />
              </AdminField>
              <AdminField label="类型" hint="按渠道类型筛选">
                <select
                  value={filters.type}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      type: event.target.value
                    }))
                  }
                  className="admin-select"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="状态" hint="只看启用或停用渠道">
                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value
                    }))
                  }
                  className="admin-select"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <AdminEmptyState
                title="没有符合条件的联系方式"
                description="当前筛选条件下没有可展示的渠道，可以清空筛选或新建一条联系方式。"
                action={
                  <button type="button" onClick={startCreate} className="admin-button-primary">
                    新建渠道
                  </button>
                }
              />
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>联系人</th>
                      <th>类型</th>
                      <th>值</th>
                      <th>状态</th>
                      <th>排序</th>
                      <th>更新时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => {
                      const statusKey = getContactStatusKey(contact.status);
                      const isBusy =
                        busyKey === `status-${contact.id}` || busyKey === `sort-${contact.id}` || busyKey === `delete-${contact.id}`;
                      const places = splitDisplayPlaces(contact.displayPlaces);

                      return (
                        <tr key={contact.id}>
                          <td>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900">{contact.name}</p>
                                <AdminStatusPill status={statusKey} label={formatContactStatus(contact.status)} />
                              </div>
                              <p className="text-xs leading-5 text-slate-500">ID: {contact.id}</p>
                              <div className="flex flex-wrap gap-2">
                                {places.length > 0 ? (
                                  places.map((place) => (
                                    <span key={place} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                                      {place}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">未配置展示位置</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-slate-600">{formatContactType(contact.type)}</td>
                          <td>
                            <div className="space-y-2 text-slate-700">
                              <p className="break-all">{contact.value}</p>
                              {contact.jumpUrl ? <p className="break-all text-xs text-blue-600">{contact.jumpUrl}</p> : null}
                              {contact.qrImage ? <p className="break-all text-xs text-slate-500">{contact.qrImage}</p> : null}
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => void handleToggleStatus(contact)}
                              disabled={isBusy}
                              className="admin-button-secondary px-3 py-1.5 text-xs"
                            >
                              {busyKey === `status-${contact.id}` ? "切换中..." : formatContactStatus(contact.status)}
                            </button>
                          </td>
                          <td>
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
                                className="admin-input w-20 py-2"
                              />
                              <button
                                type="button"
                                onClick={() => void handleSaveSort(contact)}
                                disabled={isBusy}
                                className="admin-button-secondary px-3 py-1.5 text-xs"
                              >
                                {busyKey === `sort-${contact.id}` ? "保存中..." : "保存"}
                              </button>
                            </div>
                          </td>
                          <td className="text-slate-500">{formatDateTime(contact.updatedAt)}</td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => startEdit(contact)} className="admin-button-secondary px-3 py-1.5 text-xs">
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(contact)}
                                disabled={isBusy}
                                className="admin-button-danger px-3 py-1.5 text-xs"
                              >
                                {busyKey === `delete-${contact.id}` ? "删除中..." : "删除"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </AdminPanel>

          <div className="space-y-4">
            <AdminPanel title={editingId == null ? "新建联系人" : `编辑联系人 #${editingId}`} description="保存后会立即刷新列表和右侧预览。">
              <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="类型" required hint="选择联系方式类型">
                    <select
                      value={formState.type}
                      onChange={(event) => handleFormChange("type", event.target.value)}
                      className="admin-select"
                      required
                    >
                      {CONTACT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="状态" required hint="控制前台是否展示">
                    <select
                      value={formState.status}
                      onChange={(event) => handleFormChange("status", event.target.value)}
                      className="admin-select"
                      required
                    >
                      <option value="1">启用</option>
                      <option value="0">停用</option>
                    </select>
                  </AdminField>
                </div>

                <AdminField label="名称" required hint="例如：微信客服、Telegram 群、二维码入口">
                  <input
                    value={formState.name}
                    onChange={(event) => handleFormChange("name", event.target.value)}
                    className="admin-input"
                    placeholder="请输入联系人名称"
                    required
                  />
                </AdminField>

                <AdminField label="值" required hint="账号、号码、链接文本或展示文案">
                  <textarea
                    value={formState.value}
                    onChange={(event) => handleFormChange("value", event.target.value)}
                    className="admin-textarea min-h-[92px]"
                    placeholder="请输入联系方式值"
                    required
                  />
                </AdminField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="二维码图片" hint="可直接填写地址，或上传图片">
                    <div className="space-y-2">
                      <input
                        value={formState.qrImage}
                        onChange={(event) => handleFormChange("qrImage", event.target.value)}
                        className="admin-input"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => qrUploadInputRef.current?.click()}
                        className="admin-button-secondary w-full"
                        disabled={uploadingQr}
                      >
                        {uploadingQr ? "上传中..." : "上传二维码图片"}
                      </button>
                      <input
                        ref={qrUploadInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => void handleQrUpload(event.target.files)}
                      />
                    </div>
                  </AdminField>
                  <AdminField label="跳转链接" hint="可作为按钮外链或私聊入口">
                    <input
                      value={formState.jumpUrl}
                      onChange={(event) => handleFormChange("jumpUrl", event.target.value)}
                      className="admin-input"
                      placeholder="https://t.me/..."
                    />
                  </AdminField>
                </div>

                <AdminField label="展示位置" hint={`多个位置用逗号分隔，例如 ${DISPLAY_PLACE_HINT}`}>
                  <input
                    value={formState.displayPlaces}
                    onChange={(event) => handleFormChange("displayPlaces", event.target.value)}
                    className="admin-input"
                    placeholder="home,product,detail"
                  />
                </AdminField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="排序值" hint="越小越靠前">
                    <input
                      type="number"
                      value={formState.sortOrder}
                      onChange={(event) => handleFormChange("sortOrder", event.target.value)}
                      className="admin-input"
                      placeholder="0"
                    />
                  </AdminField>
                  <AdminField label="当前状态预览" hint="保存前快速确认">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {selectedPreview.statusLabel}
                    </div>
                  </AdminField>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="admin-button-primary">
                    {submitting ? "保存中..." : editingId == null ? "创建联系人" : "保存修改"}
                  </button>
                  <button type="button" onClick={startCreate} className="admin-button-secondary">
                    清空表单
                  </button>
                </div>
              </form>
            </AdminPanel>

            <AdminPanel title="表单预览" description="便于确认前台展示方式和咨询入口。">
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">渠道名称</p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedPreview.name}</h3>
                    </div>
                    <AdminStatusPill status={selectedPreview.status} label={selectedPreview.statusLabel} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{selectedPreview.value}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedPreview.places.length > 0 ? (
                      selectedPreview.places.map((place) => (
                        <span key={place} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                          {place}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">尚未设置展示位置</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">类型</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{selectedPreview.type}</p>
                    <p className="mt-2 text-xs text-slate-500">保存字段：type / name / value / qrImage / jumpUrl / displayPlaces / sortOrder / status</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">二维码预览</p>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                      {formState.qrImage ? (
                        <img src={formState.qrImage} alt={selectedPreview.name} className="h-40 w-full object-cover" />
                      ) : (
                        <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-slate-500">
                          填入二维码图片地址或上传图片后，这里会显示预览。
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
