"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPill } from "@/components/admin/admin-status-pill";
import {
  deleteAdminProduct,
  formatProductDateTime,
  formatProductMoney,
  getProductStatusLabel,
  getRecommendationLabel,
  loadAdminProductList,
  toggleAdminProductRecommendation,
  toggleAdminProductStatus,
  type AdminProductListFilters,
  type AdminProductListViewModel
} from "@/lib/admin-products";
import type { AdminFlagValue, AdminProductRecord } from "@/types/catalog";

const defaultFilters: AdminProductListFilters = {
  keyword: "",
  categoryId: "all",
  status: "all",
  isRecommended: "all",
  page: 1,
  pageSize: 10
};

function productCountByStatus(products: AdminProductRecord[], status: AdminFlagValue) {
  return products.filter((product) => product.status === status).length;
}

function productCountByRecommendation(products: AdminProductRecord[], isRecommended: AdminFlagValue) {
  return products.filter((product) => product.isRecommended === isRecommended).length;
}

export function AdminProductManager() {
  const [filters, setFilters] = useState(defaultFilters);
  const deferredKeyword = useDeferredValue(filters.keyword);
  const [viewModel, setViewModel] = useState<AdminProductListViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      const nextViewModel = await loadAdminProductList({
        ...filters,
        keyword: deferredKeyword
      });

      if (cancelled) {
        return;
      }

      setViewModel(nextViewModel);
      setLoading(false);
      setStatusMessage(nextViewModel.source === "fallback" ? `无法加载商品列表，请检查网络连接。` : null);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [deferredKeyword, filters.categoryId, filters.isRecommended, filters.page, filters.pageSize, filters.status]);

  const categories = viewModel?.categories ?? [];
  const products = viewModel?.products ?? [];
  const totalProducts = viewModel?.total ?? products.length;
  const totalPages = viewModel ? Math.max(1, Math.ceil(viewModel.total / Math.max(1, viewModel.pageSize))) : 1;
  const totalStock = useMemo(() => products.reduce((sum, product) => sum + (product.stock ?? 0), 0), [products]);

  function updateFilters(patch: Partial<AdminProductListFilters>, resetPage = false) {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: resetPage ? 1 : patch.page ?? current.page
    }));
  }

  async function refresh() {
    setLoading(true);
    const nextViewModel = await loadAdminProductList({
      ...filters,
      keyword: deferredKeyword
    });
    setViewModel(nextViewModel);
    setLoading(false);
    setStatusMessage(nextViewModel.source === "fallback" ? `无法刷新数据，请检查网络连接。` : "数据已刷新");
  }

  async function runMutation(id: string, actionLabel: string, mutation: () => Promise<unknown>) {
    setPendingId(id);
    setStatusMessage(null);

    try {
      await mutation();
      setStatusMessage(`${actionLabel} 已完成`);
      await refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : `${actionLabel} 失败`);
    } finally {
      setPendingId(null);
    }
  }

  async function handleToggleStatus(product: AdminProductRecord) {
    const nextStatus: AdminFlagValue = product.status === 1 ? 0 : 1;
    await runMutation(String(product.id), nextStatus === 1 ? "上架" : "下架", () =>
      toggleAdminProductStatus(String(product.id), nextStatus)
    );
  }

  async function handleToggleRecommendation(product: AdminProductRecord) {
    const nextRecommendation: AdminFlagValue = product.isRecommended === 1 ? 0 : 1;
    await runMutation(String(product.id), nextRecommendation === 1 ? "推荐" : "取消推荐", () =>
      toggleAdminProductRecommendation(String(product.id), nextRecommendation)
    );
  }

  async function handleDelete(product: AdminProductRecord) {
    const confirmed = window.confirm(`确认删除商品「${product.name}」？`);
    if (!confirmed) {
      return;
    }

    await runMutation(String(product.id), "删除", () => deleteAdminProduct(String(product.id)));
  }

  const sourceTag = viewModel?.source ?? "fallback";

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="管理后台 / 商品管理"
          title="商品管理"
          description="管理商品列表、筛选、分页、状态切换和编辑功能。"
          actions={
            <>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                onClick={() => void refresh()}
                type="button"
              >
                刷新
              </button>
              <Link
                href="/admin/products/create"
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100"
              >
                新增商品
              </Link>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          <AdminMetricCard label="总商品" value={String(totalProducts)} hint="商品总数统计" accent="cyan" />
          <AdminMetricCard label="可见商品" value={String(productCountByStatus(products, 1))} hint="已上架的商品数量" accent="emerald" />
          <AdminMetricCard label="推荐商品" value={String(productCountByRecommendation(products, 1))} hint="设为推荐的商品数量" accent="amber" />
          <AdminMetricCard label="总库存" value={String(totalStock)} hint="所有商品库存总和" accent="violet" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <AdminPanel
            title="商品列表"
            description="商品列表展示与管理功能。"
            actions={
              <>
                <AdminStatusPill status={sourceTag === "api" ? "published" : "pending"} label={sourceTag === "api" ? "在线" : "离线"} />
              </>
            }
          >
            <div className="mb-4 grid gap-3 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.72fr]">
              <AdminField label="关键词" hint="按名称或描述搜索。">
                <input
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="搜索商品"
                  value={filters.keyword}
                  onChange={(event) => updateFilters({ keyword: event.target.value }, true)}
                />
              </AdminField>
              <AdminField label="分类" hint="按商品分类筛选。">
                <select
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                  value={filters.categoryId}
                  onChange={(event) => updateFilters({ categoryId: event.target.value }, true)}
                >
                  <option value="all">全部分类</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="状态" hint="0 = 隐藏，1 = 可见。">
                <select
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                  value={filters.status}
                  onChange={(event) => updateFilters({ status: event.target.value }, true)}
                >
                  <option value="all">全部状态</option>
                  <option value="1">可见</option>
                  <option value="0">隐藏</option>
                </select>
              </AdminField>
              <AdminField label="推荐" hint="0 = 普通，1 = 推荐。">
                <select
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                  value={filters.isRecommended}
                  onChange={(event) => updateFilters({ isRecommended: event.target.value }, true)}
                >
                  <option value="all">全部</option>
                  <option value="1">推荐</option>
                  <option value="0">普通</option>
                </select>
              </AdminField>
              <AdminField label="每页数量" hint="切换分页大小后会重置到第一页。">
                <select
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                  value={String(filters.pageSize)}
                  onChange={(event) => updateFilters({ pageSize: Number(event.target.value) }, true)}
                >
                  <option value="10">10 条</option>
                  <option value="20">20 条</option>
                  <option value="50">50 条</option>
                </select>
              </AdminField>
            </div>

            {statusMessage ? (
              <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                {statusMessage}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">商品</th>
                    <th className="px-4 py-3 font-medium">分类</th>
                    <th className="px-4 py-3 font-medium">价格</th>
                    <th className="px-4 py-3 font-medium">库存</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-4 py-3 font-medium">推荐</th>
                    <th className="px-4 py-3 font-medium">联系人</th>
                    <th className="px-4 py-3 font-medium">更新</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr className="bg-slate-950/40">
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                        正在加载商品数据...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr className="bg-slate-950/40">
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                        当前筛选条件下没有商品。
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="bg-slate-950/40">
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-medium text-white">{product.name}</p>
                            <p className="text-xs leading-5 text-slate-500">{product.shortDesc || "暂无摘要"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300">{product.categoryName ?? "未分类"}</td>
                        <td className="px-4 py-4 text-slate-200">{formatProductMoney(product.price)}</td>
                        <td className="px-4 py-4 text-slate-200">{product.stock ?? 0}</td>
                        <td className="px-4 py-4">
                          <AdminStatusPill status={product.status === 1 ? "published" : "disabled"} label={getProductStatusLabel(product.status)} />
                        </td>
                        <td className="px-4 py-4">
                          <AdminStatusPill
                            status={product.isRecommended === 1 ? "indexed" : "noindex"}
                            label={getRecommendationLabel(product.isRecommended)}
                          />
                        </td>
                        <td className="px-4 py-4 text-slate-300">{product.contactName ?? "未绑定"}</td>
                        <td className="px-4 py-4 text-slate-400">{formatProductDateTime(product.updatedAt)}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200"
                            >
                              编辑
                            </Link>
                            <button
                              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => void handleToggleStatus(product)}
                              disabled={pendingId === String(product.id)}
                              type="button"
                            >
                              {product.status === 1 ? "下架" : "上架"}
                            </button>
                            <button
                              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => void handleToggleRecommendation(product)}
                              disabled={pendingId === String(product.id)}
                              type="button"
                            >
                              {product.isRecommended === 1 ? "取消推荐" : "设为推荐"}
                            </button>
                            <button
                              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => void handleDelete(product)}
                              disabled={pendingId === String(product.id)}
                              type="button"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {viewModel ? (
              <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
                <span>
                  当前第 {viewModel.page}/{totalPages} 页，每页 {viewModel.pageSize} 条，本次返回 {products.length} 条，共 {viewModel.total} 条
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-white/10 px-3 py-1.5 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => updateFilters({ page: 1 })}
                    disabled={loading || viewModel.page <= 1}
                    type="button"
                  >
                    首页
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-3 py-1.5 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => updateFilters({ page: viewModel.page - 1 })}
                    disabled={loading || viewModel.page <= 1}
                    type="button"
                  >
                    上一页
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-3 py-1.5 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => updateFilters({ page: viewModel.page + 1 })}
                    disabled={loading || viewModel.page >= totalPages}
                    type="button"
                  >
                    下一页
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-3 py-1.5 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => updateFilters({ page: totalPages })}
                    disabled={loading || viewModel.page >= totalPages}
                    type="button"
                  >
                    末页
                  </button>
                </div>
              </div>
            ) : null}
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  );
}
