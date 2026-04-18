import { apiFetch } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { AdminCategoryRecord, AdminFlagValue } from "@/types/catalog";

export type AdminCategoryLoadResult = {
  categories: AdminCategoryRecord[];
  source: "api" | "fallback";
  error: string | null;
};

export type AdminCategoryFormState = {
  name: string;
  slug: string;
  sortOrder: string;
  status: string;
};

type AdminCategoryUpsertInput = {
  name: string;
  slug: string;
  sortOrder: number;
  status: AdminFlagValue;
};

function parseInteger(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "未知错误";
}

function unwrapApiResponse<T>(response: ApiResponse<T>, fallbackMessage: string) {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.data as T;
}

function sortCategories(records: AdminCategoryRecord[]) {
  return records
    .slice()
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.id - right.id);
}

function normalizePayload(state: AdminCategoryFormState): AdminCategoryUpsertInput {
  const name = state.name.trim();
  const slug = normalizeSlug(state.slug);
  const sortOrder = parseInteger(state.sortOrder);
  const status = state.status === "1" ? 1 : 0;

  if (!name) {
    throw new Error("分类名称不能为空");
  }
  if (!slug) {
    throw new Error("分类标识不能为空");
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("分类标识只能包含小写字母、数字和连字符");
  }
  if (sortOrder === null || sortOrder < 0) {
    throw new Error("排序值必须是大于等于 0 的整数");
  }

  return {
    name,
    slug,
    sortOrder,
    status
  };
}

export function createEmptyAdminCategoryFormState(): AdminCategoryFormState {
  return {
    name: "",
    slug: "",
    sortOrder: "0",
    status: "1"
  };
}

export function createAdminCategoryFormState(record: AdminCategoryRecord | null): AdminCategoryFormState {
  if (!record) {
    return createEmptyAdminCategoryFormState();
  }

  return {
    name: record.name,
    slug: record.slug,
    sortOrder: String(record.sortOrder ?? 0),
    status: String((record.status ?? 1) as AdminFlagValue)
  };
}

export function formatAdminCategoryDateTime(value: string) {
  return value.replace("T", " ").slice(0, 19);
}

export function getCategoryStatusLabel(status: AdminFlagValue | null | undefined) {
  return status === 1 ? "启用" : "停用";
}

export async function loadAdminCategories(): Promise<AdminCategoryLoadResult> {
  try {
    const response = await apiFetch<ApiResponse<AdminCategoryRecord[]>>("/categories");
    const categories = sortCategories(unwrapApiResponse(response, "分类加载失败") ?? []);

    return {
      categories,
      source: "api",
      error: null
    };
  } catch (error) {
    return {
      categories: [],
      source: "fallback",
      error: formatError(error)
    };
  }
}

export async function saveAdminCategory(mode: "create" | "edit", id: string | null, state: AdminCategoryFormState) {
  const payload = normalizePayload(state);
  const requestBody = JSON.stringify(payload);

  if (mode === "create") {
    const response = await apiFetch<ApiResponse<AdminCategoryRecord>>("/categories", {
      method: "POST",
      body: requestBody
    });
    return unwrapApiResponse(response, "分类创建失败");
  }

  if (!id) {
    throw new Error("缺少分类 ID");
  }

  const response = await apiFetch<ApiResponse<AdminCategoryRecord>>(`/categories/${id}`, {
    method: "PUT",
    body: requestBody
  });
  return unwrapApiResponse(response, "分类更新失败");
}

export async function deleteAdminCategory(id: string) {
  const response = await apiFetch<ApiResponse<void>>(`/categories/${id}`, {
    method: "DELETE"
  });
  unwrapApiResponse(response, "分类删除失败");
}

export async function updateAdminCategoryStatus(id: string, status: AdminFlagValue) {
  const response = await apiFetch<ApiResponse<AdminCategoryRecord>>(`/categories/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });

  return unwrapApiResponse(response, "分类状态更新失败");
}

export async function updateAdminCategorySort(id: string, sortOrder: number) {
  const response = await apiFetch<ApiResponse<AdminCategoryRecord>>(`/categories/${id}/sort`, {
    method: "PUT",
    body: JSON.stringify({ sortOrder })
  });

  return unwrapApiResponse(response, "分类排序更新失败");
}
