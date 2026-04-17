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

const FALLBACK_CATEGORIES: AdminCategoryRecord[] = [
  {
    id: 1,
    name: "Mail Accounts",
    slug: "mail-accounts",
    sortOrder: 10,
    status: 1,
    createdAt: "2026-04-15T09:00:00",
    updatedAt: "2026-04-15T09:00:00"
  },
  {
    id: 2,
    name: "Social Accounts",
    slug: "social-accounts",
    sortOrder: 20,
    status: 1,
    createdAt: "2026-04-15T09:00:00",
    updatedAt: "2026-04-15T09:00:00"
  },
  {
    id: 3,
    name: "Software Tools",
    slug: "software-tools",
    sortOrder: 30,
    status: 0,
    createdAt: "2026-04-15T09:00:00",
    updatedAt: "2026-04-15T09:00:00"
  }
];

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
  return error instanceof Error ? error.message : "Unknown error";
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
    throw new Error("Category name cannot be blank");
  }
  if (!slug) {
    throw new Error("Category slug cannot be blank");
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Category slug can only contain lowercase letters, numbers, and hyphens");
  }
  if (sortOrder === null || sortOrder < 0) {
    throw new Error("Sort order must be an integer greater than or equal to 0");
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
  return status === 1 ? "Enabled" : "Disabled";
}

export async function loadAdminCategories(): Promise<AdminCategoryLoadResult> {
  try {
    const response = await apiFetch<ApiResponse<AdminCategoryRecord[]>>("/categories");
    const categories = sortCategories(unwrapApiResponse(response, "Failed to load categories") ?? []);

    return {
      categories,
      source: "api",
      error: null
    };
  } catch (error) {
    return {
      categories: sortCategories(FALLBACK_CATEGORIES),
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
    return unwrapApiResponse(response, "Failed to create category");
  }

  if (!id) {
    throw new Error("Missing category ID");
  }

  const response = await apiFetch<ApiResponse<AdminCategoryRecord>>(`/categories/${id}`, {
    method: "PUT",
    body: requestBody
  });
  return unwrapApiResponse(response, "Failed to update category");
}

export async function deleteAdminCategory(id: string) {
  const response = await apiFetch<ApiResponse<void>>(`/categories/${id}`, {
    method: "DELETE"
  });
  unwrapApiResponse(response, "Failed to delete category");
}

export async function updateAdminCategoryStatus(id: string, status: AdminFlagValue) {
  const response = await apiFetch<ApiResponse<AdminCategoryRecord>>(`/categories/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });

  return unwrapApiResponse(response, "Failed to update category status");
}

export async function updateAdminCategorySort(id: string, sortOrder: number) {
  const response = await apiFetch<ApiResponse<AdminCategoryRecord>>(`/categories/${id}/sort`, {
    method: "PUT",
    body: JSON.stringify({ sortOrder })
  });

  return unwrapApiResponse(response, "Failed to update category sort order");
}
