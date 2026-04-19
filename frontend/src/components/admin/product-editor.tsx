"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPill } from "@/components/admin/admin-status-pill";
import {
  createEmptyProductFormState,
  createProductFormState,
  formatProductDateTime,
  formatProductMoney,
  loadAdminProductEditor,
  saveAdminProduct,
  type AdminProductEditorViewModel,
  type AdminProductFormState
} from "@/lib/admin-products";
import { uploadAdminImage } from "@/lib/admin-upload";
import type { AdminFlagValue } from "@/types/catalog";

type AdminProductEditorProps = {
  mode: "create" | "edit";
  productId?: string;
  copyFromProductId?: string;
};

function toStatusLabel(status: AdminFlagValue | null | undefined) {
  return status === 1 ? "可见" : "隐藏";
}

function toRecommendationLabel(status: AdminFlagValue | null | undefined) {
  return status === 1 ? "推荐" : "普通";
}

function toImageUrlsCount(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function toNoticeTone(message: string | null, source?: AdminProductEditorViewModel["source"]) {
  if (!message) {
    return "info";
  }

  return source === "fallback" ? "error" : message.includes("失败") ? "error" : "success";
}

export function AdminProductEditor({ mode, productId, copyFromProductId }: AdminProductEditorProps) {
  const router = useRouter();
  const [viewModel, setViewModel] = useState<AdminProductEditorViewModel | null>(null);
  const [form, setForm] = useState<AdminProductFormState>(createEmptyProductFormState());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<"cover" | "gallery" | null>(null);
  const coverUploadInputRef = useRef<HTMLInputElement | null>(null);
  const galleryUploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      const nextViewModel = await loadAdminProductEditor(productId, mode === "create" ? copyFromProductId : undefined);

      if (cancelled) {
        return;
      }

      const copiedFormState =
        mode === "create" && nextViewModel.copySourceProduct
          ? createProductFormState(nextViewModel.copySourceProduct)
          : createProductFormState(nextViewModel.product);

      setViewModel(nextViewModel);
      setForm(copiedFormState);
      setLoading(false);
      if (nextViewModel.source === "fallback") {
        setMessage(nextViewModel.error ?? "商品数据加载失败，请检查后端服务。");
        return;
      }

      if (mode === "create" && copyFromProductId) {
        if (nextViewModel.copySourceProduct) {
          setMessage("已载入源商品内容，保存后会创建一条新商品，不会覆盖原商品。");
          return;
        }

        if (nextViewModel.copySourceError) {
          setMessage(`复制来源商品加载失败：${nextViewModel.copySourceError}`);
          return;
        }
      }

      setMessage(nextViewModel.error);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [copyFromProductId, mode, productId]);

  const selectedCategory = useMemo(
    () => viewModel?.categories.find((category) => category.value === form.categoryId),
    [form.categoryId, viewModel?.categories]
  );

  const selectedContact = useMemo(
    () => viewModel?.contacts.find((contact) => String(contact.id) === form.contactId),
    [form.contactId, viewModel?.contacts]
  );

  const previewImageStyle = form.coverImage
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.45)), url(${form.coverImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    : undefined;

  function updateField<Key extends keyof AdminProductFormState>(key: Key, value: AdminProductFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function appendImageUrls(urls: string[]) {
    if (urls.length === 0) {
      return;
    }

    setForm((current) => {
      const existing = current.imageUrlsText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      return {
        ...current,
        imageUrlsText: [...existing, ...urls].join("\n")
      };
    });
  }

  async function handleFileUpload(target: "cover" | "gallery", fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) {
      return;
    }

    setUploadingTarget(target);
    setMessage(null);

    try {
      const uploads = [];
      for (const file of files) {
        uploads.push(await uploadAdminImage(file));
      }

      const uploadedUrls = uploads.map((item) => item.url);
      if (target === "cover" && uploadedUrls[0]) {
        updateField("coverImage", uploadedUrls[0]);
      }

      appendImageUrls(target === "gallery" ? uploadedUrls : uploadedUrls.slice(0, 1));
      setMessage(target === "cover" ? "封面图片上传成功。" : `已上传 ${uploadedUrls.length} 张图片。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "图片上传失败");
    } finally {
      setUploadingTarget(null);
      if (target === "cover" && coverUploadInputRef.current) {
        coverUploadInputRef.current.value = "";
      }
      if (target === "gallery" && galleryUploadInputRef.current) {
        galleryUploadInputRef.current.value = "";
      }
    }
  }

  async function submit(nextStatus?: AdminFlagValue) {
    const submitState = nextStatus == null ? form : { ...form, status: String(nextStatus) };

    setPendingAction(nextStatus === 1 ? "publish" : "save");
    setMessage(null);

    try {
      const saved = await saveAdminProduct(mode, productId ?? null, submitState);
      setMessage(`商品已${mode === "create" ? "创建" : "保存"}：${saved.name}`);

      if (mode === "create") {
        router.replace(`/admin/products/${saved.id}`);
        return;
      }

      setViewModel((current) =>
        current
          ? {
              ...current,
              product: saved,
              source: current.source
            }
          : current
      );
      setForm(createProductFormState(saved));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setPendingAction(null);
    }
  }

  const isCopyMode = mode === "create" && Boolean(copyFromProductId);
  const metrics = [
    { label: "分类数量", value: viewModel?.categories.length ?? 0, hint: "用于选择商品归属", accent: "cyan" },
    { label: "联系方式", value: viewModel?.contacts.length ?? 0, hint: "可绑定咨询入口", accent: "emerald" },
    { label: "图集图片", value: toImageUrlsCount(form.imageUrlsText), hint: "按换行保存", accent: "amber" },
    { label: "数据状态", value: viewModel?.source === "api" ? "正常" : "异常", hint: "失败时不显示样例数据", accent: "violet" }
  ] as const;

  const effectiveProduct = mode === "create" ? viewModel?.copySourceProduct : viewModel?.product;
  const editRecordMissing = mode === "edit" && !loading && viewModel?.source === "api" && !effectiveProduct;

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow={isCopyMode ? "商品管理 / 复制商品" : mode === "create" ? "商品管理 / 新增商品" : "商品管理 / 编辑商品"}
          title={isCopyMode ? "复制商品" : mode === "create" ? "新增商品" : `编辑商品 ${productId ?? ""}`.trim()}
          description={isCopyMode ? "已带入来源商品内容，修改后保存会创建新商品，不会覆盖原商品。" : "按模块填写商品资料，保存后会同步到前台展示。"}
          actions={
            <>
              <Link href="/admin/products" className="admin-button-secondary">
                返回列表
              </Link>
              <button
                className="admin-button-secondary"
                onClick={() => void submit(0)}
                disabled={loading || pendingAction !== null || editRecordMissing}
                type="button"
              >
                保存草稿
              </button>
              <button
                className="admin-button-primary"
                onClick={() => void submit(1)}
                disabled={loading || pendingAction !== null || editRecordMissing}
                type="button"
              >
                保存并上架
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <AdminMetricCard
              key={metric.label}
              label={metric.label}
              value={String(metric.value)}
              hint={metric.hint}
              accent={metric.accent}
            />
          ))}
        </div>

        {message ? <AdminNotice tone={toNoticeTone(message, viewModel?.source)} message={message} /> : null}

        {editRecordMissing ? (
          <AdminEmptyState
            title="没有找到这个商品"
            description="当前商品可能已被删除，或商品 ID 不正确。请返回列表重新选择。"
            action={
              <Link href="/admin/products" className="admin-button-primary">
                返回商品列表
              </Link>
            }
          />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-6">
            <AdminPanel title="基础信息" description="这些字段决定商品在前台列表和详情页的主要展示。">
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminField label="分类" hint="选择商品归属分类。" required>
                  <select
                    className="admin-select"
                    value={form.categoryId}
                    onChange={(event) => updateField("categoryId", event.target.value)}
                    disabled={loading || editRecordMissing}
                  >
                    <option value="">请选择分类</option>
                    {viewModel?.categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="商品名称" hint="建议保持简洁，方便前台浏览。" required>
                  <input
                    className="admin-input"
                    placeholder="例如：Gmail 资源包"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    disabled={loading || editRecordMissing}
                  />
                </AdminField>
                <AdminField label="状态" hint="可见会展示到前台，隐藏则仅后台保留。" required>
                  <select
                    className="admin-select"
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    disabled={loading || editRecordMissing}
                  >
                    <option value="1">可见</option>
                    <option value="0">隐藏</option>
                  </select>
                </AdminField>
                <AdminField label="是否推荐" hint="推荐商品会在前台优先展示。">
                  <select
                    className="admin-select"
                    value={form.isRecommended}
                    onChange={(event) => updateField("isRecommended", event.target.value)}
                    disabled={loading || editRecordMissing}
                  >
                    <option value="1">推荐</option>
                    <option value="0">普通</option>
                  </select>
                </AdminField>
                <AdminField label="排序值" hint="数字越小越靠前。">
                  <input
                    className="admin-input"
                    placeholder="0"
                    value={form.sortOrder}
                    onChange={(event) => updateField("sortOrder", event.target.value)}
                    disabled={loading || editRecordMissing}
                  />
                </AdminField>
                <AdminField label="联系人" hint="绑定后详情页可跳转到对应联系方式。">
                  <select
                    className="admin-select"
                    value={form.contactId}
                    onChange={(event) => updateField("contactId", event.target.value)}
                    disabled={loading || editRecordMissing}
                  >
                    <option value="">不绑定</option>
                    {viewModel?.contacts.map((contact) => (
                      <option key={contact.id} value={String(contact.id)}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="简短说明" hint="用于前台卡片和详情页首屏摘要。" className="lg:col-span-2">
                  <textarea
                    className="admin-textarea"
                    placeholder="简要描述商品优势和适用场景。"
                    value={form.shortDesc}
                    onChange={(event) => updateField("shortDesc", event.target.value)}
                    disabled={loading || editRecordMissing}
                  />
                </AdminField>
              </div>
            </AdminPanel>

            <AdminPanel title="媒体与详情" description="上传或填写封面、图集和详情正文。">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
                <div className="space-y-4">
                  <AdminField
                    label="封面图 URL"
                    hint="优先使用后台上传生成的 /api/admin/uploads/files/... 地址，或公开可访问的 http/https 图片地址；不要填写 localhost、127.0.0.1、backend 等内网地址。"
                  >
                    <div className="space-y-3">
                      <input
                        className="admin-input"
                        placeholder="/api/admin/uploads/files/2026/04/example.png 或 https://..."
                        value={form.coverImage}
                        onChange={(event) => updateField("coverImage", event.target.value)}
                        disabled={loading || editRecordMissing}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="admin-button-secondary px-3 py-1.5 text-xs"
                          onClick={() => coverUploadInputRef.current?.click()}
                          disabled={uploadingTarget !== null || loading || editRecordMissing}
                          type="button"
                        >
                          {uploadingTarget === "cover" ? "上传中..." : "上传封面"}
                        </button>
                        <button
                          className="admin-button-secondary px-3 py-1.5 text-xs"
                          onClick={() => appendImageUrls(form.coverImage ? [form.coverImage] : [])}
                          disabled={!form.coverImage || uploadingTarget !== null || editRecordMissing}
                          type="button"
                        >
                          加入图集
                        </button>
                      </div>
                      <input
                        ref={coverUploadInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => void handleFileUpload("cover", event.target.files)}
                        type="file"
                      />
                    </div>
                  </AdminField>
                  <AdminField
                    label="图集"
                    hint="每行一张图片，支持站内上传路径或公开 http/https 地址；不要填写 localhost、127.0.0.1、backend 等内网地址。"
                  >
                    <div className="space-y-3">
                      <textarea
                        className="admin-textarea"
                        placeholder={"/api/admin/uploads/files/2026/04/gallery-1.png\n/api/admin/uploads/files/2026/04/gallery-2.png\nhttps://example.com/gallery-3.png"}
                        value={form.imageUrlsText}
                        onChange={(event) => updateField("imageUrlsText", event.target.value)}
                        disabled={loading || editRecordMissing}
                      />
                      <button
                        className="admin-button-secondary px-3 py-1.5 text-xs"
                        onClick={() => galleryUploadInputRef.current?.click()}
                        disabled={uploadingTarget !== null || loading || editRecordMissing}
                        type="button"
                      >
                        {uploadingTarget === "gallery" ? "上传中..." : "批量上传图集"}
                      </button>
                      <input
                        ref={galleryUploadInputRef}
                        accept="image/*"
                        className="hidden"
                        multiple
                        onChange={(event) => void handleFileUpload("gallery", event.target.files)}
                        type="file"
                      />
                    </div>
                  </AdminField>
                </div>
                <div className="admin-subtle-card p-4">
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-900">封面预览</p>
                      <div
                        className="flex h-48 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-100 p-6 text-center text-sm leading-6 text-slate-500"
                        style={previewImageStyle}
                      >
                        {form.coverImage ? "" : "填写封面图 URL 后，这里直接预览。"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <AdminStatusPill status={form.status === "1" ? "published" : "disabled"} label={toStatusLabel(Number(form.status) as AdminFlagValue)} />
                      <p className="text-xs leading-5 text-slate-500">当前仅展示后端返回的数据，接口异常时不会填充样例内容。</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <AdminField label="商品详情正文" hint="填写商品卖点、说明和注意事项。">
                  <textarea
                    className="admin-textarea"
                    placeholder="填写商品详情正文。"
                    value={form.content}
                    onChange={(event) => updateField("content", event.target.value)}
                    disabled={loading || editRecordMissing}
                  />
                </AdminField>
              </div>
            </AdminPanel>

            <AdminPanel title="价格与库存" description="这些字段用于前台价格和库存展示。">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminField label="售价" hint="商品实际售价，支持两位小数。" required>
                  <input
                    className="admin-input"
                    placeholder="18.00"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    disabled={loading || editRecordMissing}
                  />
                </AdminField>
                <AdminField label="原价" hint="可为空，用于展示划线价，支持两位小数。">
                  <input
                    className="admin-input"
                    placeholder="30.00"
                    inputMode="decimal"
                    value={form.originalPrice}
                    onChange={(event) => updateField("originalPrice", event.target.value)}
                    disabled={loading || editRecordMissing}
                  />
                </AdminField>
                <AdminField label="库存" hint="商品库存数量。" required>
                  <input
                    className="admin-input"
                    placeholder="126"
                    value={form.stock}
                    onChange={(event) => updateField("stock", event.target.value)}
                    disabled={loading || editRecordMissing}
                  />
                </AdminField>
                <AdminField label="当前状态" hint="与商品状态同步。">
                  <div className="flex h-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {toStatusLabel(Number(form.status) as AdminFlagValue)}
                  </div>
                </AdminField>
              </div>
            </AdminPanel>
          </div>

          <div className="space-y-4">
            <AdminMetricCard label="编辑模式" value={isCopyMode ? "复制" : mode === "create" ? "新增" : "编辑"} hint="当前表单操作类型" accent="cyan" />
            <AdminMetricCard label="图集数量" value={String(toImageUrlsCount(form.imageUrlsText))} hint="提交时保存为数组" accent="emerald" />
            <AdminMetricCard label="数据状态" value={viewModel?.source === "api" ? "正常" : "异常"} hint="只使用后端返回数据" accent="amber" />
            <AdminMetricCard label="商品状态" value={toStatusLabel(Number(form.status) as AdminFlagValue)} hint="控制前台可见性" accent="violet" />

            <AdminPanel title="当前预览" description="根据表单即时生成运营预览。">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="admin-kicker">Preview</p>
                      <h3 className="text-lg font-semibold text-slate-900">{form.name || "未命名商品"}</h3>
                    </div>
                    <AdminStatusPill status={form.status === "1" ? "published" : "disabled"} label={toStatusLabel(Number(form.status) as AdminFlagValue)} />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{form.shortDesc || "这里会显示简短说明。"}</p>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-slate-500">分类</p>
                      <p className="mt-1 font-semibold text-slate-900">{selectedCategory?.label ?? "未选择"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-slate-500">联系人</p>
                      <p className="mt-1 font-semibold text-slate-900">{selectedContact?.name ?? "不绑定"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-slate-500">售价</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatProductMoney(form.price)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-slate-500">库存</p>
                      <p className="mt-1 font-semibold text-slate-900">{form.stock || 0}</p>
                    </div>
                  </div>
                  {effectiveProduct ? (
                    <p className="text-xs leading-5 text-slate-500">
                      {isCopyMode ? "来源商品更新" : "最近更新"}：{formatProductDateTime(effectiveProduct.updatedAt)} ·{" "}
                      {toRecommendationLabel(Number(form.isRecommended) as AdminFlagValue)}
                    </p>
                  ) : null}
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="保存前检查" description="提交前确认必填项和展示效果。">
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li>分类、商品名称、售价和库存必须填写。</li>
                <li>联系人可以为空；为空时详情页不绑定独立咨询渠道。</li>
                <li>图集按换行分割，建议每行只放一个图片地址。</li>
                <li>商品图片建议优先使用站内上传路径，不能填写 localhost、127.0.0.1、backend 等内网地址。</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="admin-button-secondary"
                  onClick={() => void submit(0)}
                  disabled={loading || pendingAction !== null || editRecordMissing}
                  type="button"
                >
                  保存草稿
                </button>
                <button
                  className="admin-button-primary"
                  onClick={() => void submit(1)}
                  disabled={loading || pendingAction !== null || editRecordMissing}
                  type="button"
                >
                  保存并上架
                </button>
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
