"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminField } from "@/components/admin/admin-field";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminNotice } from "@/components/admin/admin-notice";
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

  async function runLoad(nextFilters: AdminProductListFilters) {
    setLoading(true);
    const nextViewModel = await loadAdminProductList({
      ...nextFilters,
      keyword: deferredKeyword
    });
    setViewModel(nextViewModel);
    setLoading(false);
    setStatusMessage(nextViewModel.source === "fallback" ? "商品数据暂时不可用，请检查后台接口或登录状态。" : null);
  }

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
      setStatusMessage(nextViewModel.source === "fallback" ? "商品数据暂时不可用，请检查后台接口或登录状态。" : null);
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
    await runLoad(filters);
    if (viewModel?.source !== "fallback") {
      setStatusMessage("商品列表已更新。");
    }
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
    await runMutation(String(product.id), nextStatus === 1 ? "商品已上架" : "商品已下架", () =>
      toggleAdminProductStatus(String(product.id), nextStatus)
    );
  }

  async function handleToggleRecommendation(product: AdminProductRecord) {
    const nextRecommendation: AdminFlagValue = product.isRecommended === 1 ? 0 : 1;
    await runMutation(String(product.id), nextRecommendation === 1 ? "已设为推荐" : "已取消推荐", () =>
      toggleAdminProductRecommendation(String(product.id), nextRecommendation)
    );
  }

  async function handleDelete(product: AdminProductRecord) {
    const confirmed = window.confirm(`确认删除商品「${product.name}」？`);
    if (!confirmed) {
      return;
    }

    await runMutation(String(product.id), "商品已删除", () => deleteAdminProduct(String(product.id)));
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="内容管理 / 商品"
          title="商品管理"
          description="把最常用的商品维护动作集中到一个页面：筛选、翻页、上下架、推荐和编辑都能快速完成。"
          actions={
            <>
              <button className="admin-button-secondary" onClick={() => void refresh()} type="button">
                刷新列表
              </button>
              <Link href="/admin/products/create" className="admin-button-primary">
                新增商品
              </Link>
            </>
          }
        />

        {statusMessage ? (
          <AdminNotice tone={viewModel?.source === "fallback" ? "error" : "success"} message={statusMessage} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard label="商品总数" value={String(totalProducts)} hint="已录入商品总量" accent="cyan" />
          <AdminMetricCard label="已上架" value={String(productCountByStatus(products, 1))} hint="前台当前可见商品" accent="emerald" />
          <AdminMetricCard label="推荐中" value={String(productCountByRecommendation(products, 1))} hint="首页或优先推荐商品" accent="amber" />
          <AdminMetricCard label="库存总量" value={String(totalStock)} hint="当前页商品库存总和" accent="violet" />
        </div>

        <AdminPanel title="筛选与列表" description="先筛后看，适合新手快速定位商品。">
          <div className="mb-5 grid gap-3 xl:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr_0.72fr]">
            <AdminField label="关键词" hint="按商品名称或摘要搜索。">
              <input
                className="admin-input"
                placeholder="搜索商品"
                value={filters.keyword}
                onChange={(event) => updateFilters({ keyword: event.target.value }, true)}
              />
            </AdminField>
            <AdminField label="分类" hint="按商品分类筛选。">
              <select className="admin-select" value={filters.categoryId} onChange={(event) => updateFilters({ categoryId: event.target.value }, true)}>
                <option value="all">全部分类</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="状态" hint="筛选上架或隐藏商品。">
              <select className="admin-select" value={filters.status} onChange={(event) => updateFilters({ status: event.target.value }, true)}>
                <option value="all">全部状态</option>
                <option value="1">已上架</option>
                <option value="0">隐藏</option>
              </select>
            </AdminField>
            <AdminField label="推荐" hint="区分推荐商品和普通商品。">
              <select
                className="admin-select"
                value={filters.isRecommended}
                onChange={(event) => updateFilters({ isRecommended: event.target.value }, true)}
              >
                <option value="all">全部</option>
                <option value="1">推荐商品</option>
                <option value="0">普通商品</option>
              </select>
            </AdminField>
            <AdminField label="每页数量" hint="切换后自动回到第一页。">
              <select className="admin-select" value={String(filters.pageSize)} onChange={(event) => updateFilters({ pageSize: Number(event.target.value) }, true)}>
                <option value="10">10 条</option>
                <option value="20">20 条</option>
                <option value="50">50 条</option>
              </select>
            </AdminField>
          </div>

          {viewModel?.source === "fallback" && !loading ? (
            <AdminEmptyState
              title="商品列表暂时不可用"
              description="当前没有读取到真实商品数据。请先确认后端服务和登录状态，然后重试。"
              action={
                <button className="admin-button-primary" onClick={() => void refresh()} type="button">
                  重新加载
                </button>
              }
            />
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>商品信息</th>
                      <th>分类</th>
                      <th>价格</th>
                      <th>库存</th>
                      <th>状态</th>
                      <th>推荐</th>
                      <th>联系人</th>
                      <th>更新时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <tr key={`loading-${index}`}>
                          <td colSpan={9}>
                            <div className="grid gap-2">
                              <div className="h-4 w-40 rounded-full bg-slate-200" />
                              <div className="h-3 w-64 rounded-full bg-slate-100" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={9}>
                          <AdminEmptyState title="当前没有符合条件的商品" description="可以调整筛选条件，或者直接新增一条商品。" />
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-xs leading-5 text-slate-500">{product.shortDesc || "暂无摘要说明"}</p>
                            </div>
                          </td>
                          <td>{product.categoryName ?? "未分类"}</td>
                          <td className="font-medium text-slate-900">{formatProductMoney(product.price)}</td>
                          <td>{product.stock ?? 0}</td>
                          <td>
                            <AdminStatusPill status={product.status === 1 ? "published" : "disabled"} label={getProductStatusLabel(product.status)} />
                          </td>
                          <td>
                            <AdminStatusPill
                              status={product.isRecommended === 1 ? "indexed" : "noindex"}
                              label={getRecommendationLabel(product.isRecommended)}
                            />
                          </td>
                          <td>{product.contactName ?? "未绑定"}</td>
                          <td>{formatProductDateTime(product.updatedAt)}</td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/admin/products/${product.id}`} className="admin-button-secondary !px-3 !py-1.5 !text-xs">
                                编辑
                              </Link>
                              <button
                                className="admin-button-secondary !px-3 !py-1.5 !text-xs"
                                onClick={() => void handleToggleStatus(product)}
                                disabled={pendingId === String(product.id)}
                                type="button"
                              >
                                {product.status === 1 ? "下架" : "上架"}
                              </button>
                              <button
                                className="admin-button-secondary !px-3 !py-1.5 !text-xs"
                                onClick={() => void handleToggleRecommendation(product)}
                                disabled={pendingId === String(product.id)}
                                type="button"
                              >
                                {product.isRecommended === 1 ? "取消推荐" : "设为推荐"}
                              </button>
                              <button
                                className="admin-button-danger !px-3 !py-1.5 !text-xs"
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

              {viewModel && products.length > 0 ? (
                <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                  <span>
                    第 {viewModel.page} / {totalPages} 页 · 每页 {viewModel.pageSize} 条 · 共 {viewModel.total} 条
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button className="admin-button-secondary" onClick={() => updateFilters({ page: 1 })} disabled={loading || viewModel.page <= 1} type="button">
                      首页
                    </button>
                    <button
                      className="admin-button-secondary"
                      onClick={() => updateFilters({ page: viewModel.page - 1 })}
                      disabled={loading || viewModel.page <= 1}
                      type="button"
                    >
                      上一页
                    </button>
                    <button
                      className="admin-button-secondary"
                      onClick={() => updateFilters({ page: viewModel.page + 1 })}
                      disabled={loading || viewModel.page >= totalPages}
                      type="button"
                    >
                      下一页
                    </button>
                    <button
                      className="admin-button-secondary"
                      onClick={() => updateFilters({ page: totalPages })}
                      disabled={loading || viewModel.page >= totalPages}
                      type="button"
                    >
                      末页
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
