"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
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
};

const inputClassName =
  "rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition-colors focus:border-cyan-400/40 focus:bg-slate-900";

const textAreaClassName =
  "min-h-[132px] rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 transition-colors focus:border-cyan-400/40 focus:bg-slate-900";

const selectClassName =
  "rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/40 focus:bg-slate-900";

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

export function AdminProductEditor({ mode, productId }: AdminProductEditorProps) {
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
      const nextViewModel = await loadAdminProductEditor(productId);

      if (cancelled) {
        return;
      }

      setViewModel(nextViewModel);
      setForm(createProductFormState(nextViewModel.product));
      setLoading(false);
      setMessage(nextViewModel.source === "fallback" ? `无法加载商品数据，请检查网络连接后重试。` : null);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [productId]);

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
        backgroundImage: `linear-gradient(180deg, rgba(8, 15, 28, 0.32), rgba(8, 15, 28, 0.88)), url(${form.coverImage})`,
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
      setMessage(target === "cover" ? "封面图片上传成功" : `已上传 ${uploadedUrls.length} 张图片`);
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

  const metrics = [
    { label: "分类", value: viewModel?.categories.length ?? 0, hint: "读取真实分类接口" },
    { label: "联系方式", value: viewModel?.contacts.length ?? 0, hint: "读取真实联系方式接口" },
    { label: "图集", value: toImageUrlsCount(form.imageUrlsText), hint: "一行一张图，直接提交数组" },
    { label: "数据源", value: viewModel?.source === "api" ? "API" : "Fallback", hint: "可用时自动切换" }
  ] as const;

  const effectiveProduct = viewModel?.product;

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow={mode === "create" ? "Admin / Products / Create" : "Admin / Products / Edit"}
          title={mode === "create" ? "新增商品" : `编辑商品 ${productId ?? ""}`.trim()}
          description="表单信息已经对齐，提交时会直接保存。"
          actions={
            <>
              <Link
                href="/admin/products"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
              >
                返回列表
              </Link>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
                onClick={() => void submit(0)}
                disabled={loading || pendingAction !== null}
                type="button"
              >
                保存草稿
              </button>
              <button
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 disabled:opacity-50"
                onClick={() => void submit(1)}
                disabled={loading || pendingAction !== null}
                type="button"
              >
                保存并上架
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <AdminMetricCard key={metric.label} label={metric.label} value={String(metric.value)} hint={metric.hint} accent="cyan" />
          ))}
        </div>

        {message ? (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{message}</div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-6">
            <AdminPanel title="基础信息" description="这里的内容都能直接保存。">
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminField label="分类" hint="选择商品分类。" required>
                  <select
                    className={selectClassName}
                    value={form.categoryId}
                    onChange={(event) => updateField("categoryId", event.target.value)}
                  >
                    <option value="">请选择分类</option>
                    {viewModel?.categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="商品名称" hint="填写商品名称。" required>
                  <input
                    className={inputClassName}
                    placeholder="例如：Gmail 资源包"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                  />
                </AdminField>
                <AdminField label="状态" hint="0 = 隐藏，1 = 可见。" required>
                  <select className={selectClassName} value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                    <option value="1">可见</option>
                    <option value="0">隐藏</option>
                  </select>
                </AdminField>
                <AdminField label="是否推荐" hint="推荐商品会优先展示。">
                  <select
                    className={selectClassName}
                    value={form.isRecommended}
                    onChange={(event) => updateField("isRecommended", event.target.value)}
                  >
                    <option value="1">推荐</option>
                    <option value="0">普通</option>
                  </select>
                </AdminField>
                <AdminField label="排序值" hint="数字越小越靠前。">
                  <input
                    className={inputClassName}
                    placeholder="0"
                    value={form.sortOrder}
                    onChange={(event) => updateField("sortOrder", event.target.value)}
                  />
                </AdminField>
                <AdminField label="联系人" hint="可选择绑定联系人，允许为空。">
                  <select className={selectClassName} value={form.contactId} onChange={(event) => updateField("contactId", event.target.value)}>
                    <option value="">不绑定</option>
                    {viewModel?.contacts.map((contact) => (
                      <option key={contact.id} value={String(contact.id)}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="简短说明" hint="用于前台卡片和详情页首屏的摘要。" className="lg:col-span-2">
                  <textarea
                    className={textAreaClassName}
                    placeholder="用于前台卡片和详情页首屏的摘要。"
                    value={form.shortDesc}
                    onChange={(event) => updateField("shortDesc", event.target.value)}
                  />
                </AdminField>
              </div>
            </AdminPanel>

            <AdminPanel title="媒体与详情" description="这里对应封面图、图集和商品详情。">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
                <div className="space-y-4">
                  <AdminField label="封面图 URL" hint="商品封面图片地址。">
                    <div className="space-y-3">
                      <input
                        className={inputClassName}
                        placeholder="https://..."
                        value={form.coverImage}
                        onChange={(event) => updateField("coverImage", event.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 disabled:opacity-50"
                          onClick={() => coverUploadInputRef.current?.click()}
                          disabled={uploadingTarget !== null}
                          type="button"
                        >
                          {uploadingTarget === "cover" ? "上传中..." : "上传封面图片"}
                        </button>
                        <button
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-50"
                          onClick={() => appendImageUrls(form.coverImage ? [form.coverImage] : [])}
                          disabled={!form.coverImage || uploadingTarget !== null}
                          type="button"
                        >
                          将封面加入图集
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
                  <AdminField label="图集" hint="每行一张图，对应 imageUrls 数组。">
                    <div className="space-y-3">
                      <textarea
                        className={textAreaClassName}
                        placeholder={"https://...\nhttps://...\nhttps://..."}
                        value={form.imageUrlsText}
                        onChange={(event) => updateField("imageUrlsText", event.target.value)}
                      />
                      <button
                        className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 disabled:opacity-50"
                        onClick={() => galleryUploadInputRef.current?.click()}
                        disabled={uploadingTarget !== null}
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
                <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/70 p-4">
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">封面预览</p>
                      <div
                        className="flex h-48 items-center justify-center rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_rgba(15,23,42,0.92)_72%)] p-6 text-center text-sm leading-6 text-slate-400"
                        style={previewImageStyle}
                      >
                        {form.coverImage ? "封面图会在这里预览" : "填写封面图 URL 后，这里直接预览"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <AdminStatusPill status={form.status === "1" ? "published" : "disabled"} label={toStatusLabel(Number(form.status) as AdminFlagValue)} />
                      <p className="text-xs leading-5 text-slate-500">
                        当前商品来源：{viewModel?.source === "api" ? "真实接口" : "本地样例"}。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <AdminField label="商品详情正文" hint="填写商品详情正文。">
                  <textarea
                    className={textAreaClassName}
                    placeholder="填写商品详情正文。"
                    value={form.content}
                    onChange={(event) => updateField("content", event.target.value)}
                  />
                </AdminField>
              </div>
            </AdminPanel>

            <AdminPanel title="价格与库存" description="这些内容会直接保存。">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminField label="售价" hint="商品售价。" required>
                  <input
                    className={inputClassName}
                    placeholder="18"
                    value={form.price}
                    onChange={(event) => updateField("price", event.target.value)}
                  />
                </AdminField>
                <AdminField label="原价" hint="商品原价，允许为空。">
                  <input
                    className={inputClassName}
                    placeholder="30"
                    value={form.originalPrice}
                    onChange={(event) => updateField("originalPrice", event.target.value)}
                  />
                </AdminField>
                <AdminField label="库存" hint="商品库存数量。" required>
                  <input
                    className={inputClassName}
                    placeholder="126"
                    value={form.stock}
                    onChange={(event) => updateField("stock", event.target.value)}
                  />
                </AdminField>
                <AdminField label="当前状态" hint="与 status 同步。">
                  <div className="flex h-full items-center rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    {toStatusLabel(Number(form.status) as AdminFlagValue)}
                  </div>
                </AdminField>
              </div>
            </AdminPanel>

            <AdminPanel
              title="操作区"
              description="保存未保存内容和上架都会直接保存。"
              actions={
                <>
                  <button
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-50"
                    onClick={() => void submit(0)}
                    disabled={loading || pendingAction !== null}
                    type="button"
                  >
                    保存未保存内容
                  </button>
                  <button
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-50"
                    onClick={() => void submit(1)}
                    disabled={loading || pendingAction !== null}
                    type="button"
                  >
                    保存并上架
                  </button>
                </>
              }
            >
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-sm font-medium text-white">提交建议</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    <li>分类、名称、售价和库存是必填。</li>
                    <li>如果不绑定联系人，保留空值即可。</li>
                    <li>图集内容会按换行分割成数组。</li>
                  </ul>
                </div>
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-900/70 p-4">
                  <p className="text-sm font-medium text-white">实际保存内容</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    categoryId / name / coverImage / shortDesc / content / price / originalPrice / stock / contactId / isRecommended /
                    sortOrder / status / imageUrls
                  </p>
                </div>
              </div>
            </AdminPanel>
          </div>

          <div className="space-y-4">
            <AdminMetricCard label="编辑模式" value={mode === "create" ? "Create" : "Edit"} hint="当前页面已接表单流" accent="cyan" />
            <AdminMetricCard label="图集数量" value={String(toImageUrlsCount(form.imageUrlsText))} hint="提交时会转为数组" accent="emerald" />
            <AdminMetricCard label="商品来源" value={viewModel?.source === "api" ? "API" : "Fallback"} hint="可用时自动切换" accent="amber" />
            <AdminMetricCard label="状态标签" value={toStatusLabel(Number(form.status) as AdminFlagValue)} hint="0/1 语义已对齐" accent="violet" />

            <AdminPanel title="当前预览" description="根据表单即时拼出商品卡片预览。">
              <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,28,0.92)_0%,rgba(10,19,35,0.82)_100%)] p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Preview</p>
                      <h3 className="text-lg font-semibold text-white">{form.name || "未命名商品"}</h3>
                    </div>
                    <AdminStatusPill status={form.status === "1" ? "published" : "disabled"} label={toStatusLabel(Number(form.status) as AdminFlagValue)} />
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{form.shortDesc || "这里会显示简短说明。"}</p>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-slate-500">分类</p>
                      <p className="mt-1 font-semibold text-white">{selectedCategory?.label ?? "未选择"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-slate-500">联系人</p>
                      <p className="mt-1 font-semibold text-white">{selectedContact?.name ?? "不绑定"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-slate-500">售价</p>
                      <p className="mt-1 font-semibold text-white">{formatProductMoney(form.price)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-slate-500">库存</p>
                      <p className="mt-1 font-semibold text-white">{form.stock || 0}</p>
                    </div>
                  </div>
                  {effectiveProduct ? (
                    <p className="text-xs leading-5 text-slate-500">
                      最近更新：{formatProductDateTime(effectiveProduct.updatedAt)} · {toRecommendationLabel(Number(form.isRecommended) as AdminFlagValue)}
                    </p>
                  ) : null}
                </div>
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
