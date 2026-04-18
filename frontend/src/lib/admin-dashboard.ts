import { apiFetch } from "@/lib/api";
import type { AdminDashboardStats, ApiResponse } from "@/types/api";

type DashboardMetric = {
  label: string;
  value: string;
  hint: string;
  accent: "cyan" | "emerald" | "amber" | "violet";
};

type DashboardBarItem = {
  name: string;
  total: number;
  active: number;
};

type DashboardDonutItem = {
  name: string;
  value: number;
};

export type AdminDashboardViewModel = {
  stats: AdminDashboardStats;
  metrics: DashboardMetric[];
  moduleBars: DashboardBarItem[];
  productMix: DashboardDonutItem[];
};

function unwrapApiResponse<T>(response: ApiResponse<T>, fallbackMessage: string) {
  if (!response.success || !response.data) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.data;
}

export async function loadAdminDashboard(): Promise<AdminDashboardViewModel> {
  const response = await apiFetch<ApiResponse<AdminDashboardStats>>("/admin/dashboard/stats");
  const stats = unwrapApiResponse(response, "读取后台统计失败");

  return {
    stats,
    metrics: [
      { label: "商品总数", value: String(stats.totalProducts), hint: "当前已录入商品", accent: "cyan" },
      { label: "已上架商品", value: String(stats.activeProducts), hint: "前台可见商品", accent: "emerald" },
      { label: "推荐商品", value: String(stats.recommendedProducts), hint: "首页或优先推荐", accent: "amber" },
      { label: "启用联系方式", value: String(stats.activeContacts), hint: "当前对外可联系渠道", accent: "violet" }
    ],
    moduleBars: [
      { name: "商品", total: stats.totalProducts, active: stats.activeProducts },
      { name: "分类", total: stats.totalCategories, active: stats.activeCategories },
      { name: "联系方式", total: stats.totalContacts, active: stats.activeContacts }
    ],
    productMix: [
      { name: "推荐商品", value: stats.recommendedProducts },
      { name: "普通商品", value: Math.max(0, stats.activeProducts - stats.recommendedProducts) },
      { name: "未上架", value: Math.max(0, stats.totalProducts - stats.activeProducts) }
    ]
  };
}
