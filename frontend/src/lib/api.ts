import { getStoredAdminAuthToken } from "@/lib/auth";
import { joinApiPath } from "@/lib/api-base";
import type { ApiListResponse, ApiResponse } from "@/types/api";
import type {
  AdminCategoryRecord,
  AdminContactRecord,
  AdminProductQuery,
  AdminProductRecord,
  AdminProductUpsertInput
} from "@/types/catalog";

const adminTokenStorageKeys = ["sell_web_admin_token", "sell-web-admin-token", "admin_token"] as const;

function toQueryString(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : "";
}

function getStoredAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const authToken = getStoredAdminAuthToken();
  if (authToken) {
    return authToken;
  }

  for (const key of adminTokenStorageKeys) {
    const value = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
}

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});
  const hasBody = init?.body !== undefined && init?.body !== null;

  if (hasBody && !(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredAdminToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(joinApiPath(path), {
      ...init,
      headers: buildHeaders(init),
      cache: "no-store"
    });
  } catch {
    throw new Error("无法连接后端服务，请确认 Spring Boot 服务已启动。");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload ? String((payload as { message?: string | null }).message ?? "") : "";
    throw new Error(message || `接口请求失败（${response.status}）`);
  }

  return payload as T;
}

function unwrapApiResponse<T>(response: ApiResponse<T>, fallbackMessage: string) {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.data as T;
}

function unwrapApiListResponse<T>(
  response: ApiResponse<T[] | ApiListResponse<T>>,
  fallbackMessage: string
): ApiListResponse<T> {
  const data = unwrapApiResponse(response, fallbackMessage);

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      pageSize: data.length
    };
  }

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: typeof data?.total === "number" ? data.total : 0,
    page: typeof data?.page === "number" ? data.page : 1,
    pageSize: typeof data?.pageSize === "number" ? data.pageSize : Array.isArray(data?.items) ? data.items.length : 0
  };
}

export type AdminCatalogApi = {
  listCategories(): Promise<AdminCategoryRecord[]>;
  listContacts(): Promise<AdminContactRecord[]>;
  listProducts(query?: AdminProductQuery): Promise<ApiListResponse<AdminProductRecord>>;
  getProduct(id: string): Promise<AdminProductRecord>;
  createProduct(input: AdminProductUpsertInput): Promise<AdminProductRecord>;
  updateProduct(id: string, input: AdminProductUpsertInput): Promise<AdminProductRecord>;
  deleteProduct(id: string): Promise<void>;
  updateProductStatus(id: string, status: 0 | 1): Promise<AdminProductRecord>;
  updateProductRecommended(id: string, isRecommended: 0 | 1): Promise<AdminProductRecord>;
};

export const adminCatalogApi: AdminCatalogApi = {
  async listCategories() {
    const response = await apiFetch<ApiResponse<AdminCategoryRecord[]>>("/categories");
    return unwrapApiResponse(response, "分类加载失败");
  },
  async listContacts() {
    const response = await apiFetch<ApiResponse<AdminContactRecord[]>>("/contacts");
    return unwrapApiResponse(response, "联系人加载失败");
  },
  async listProducts(query) {
    const response = await apiFetch<ApiResponse<AdminProductRecord[] | ApiListResponse<AdminProductRecord>>>(
      `/products${toQueryString(query)}`
    );
    return unwrapApiListResponse(response, "商品加载失败");
  },
  async getProduct(id) {
    const response = await apiFetch<ApiResponse<AdminProductRecord>>(`/products/${id}`);
    return unwrapApiResponse(response, "商品详情加载失败");
  },
  async createProduct(input) {
    const response = await apiFetch<ApiResponse<AdminProductRecord>>("/products", {
      method: "POST",
      body: JSON.stringify(input)
    });
    return unwrapApiResponse(response, "商品创建失败");
  },
  async updateProduct(id, input) {
    const response = await apiFetch<ApiResponse<AdminProductRecord>>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
    return unwrapApiResponse(response, "商品更新失败");
  },
  async deleteProduct(id) {
    const response = await apiFetch<ApiResponse<void>>(`/products/${id}`, { method: "DELETE" });
    unwrapApiResponse(response, "商品删除失败");
  },
  async updateProductStatus(id, status) {
    const response = await apiFetch<ApiResponse<AdminProductRecord>>(`/products/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    return unwrapApiResponse(response, "商品状态更新失败");
  },
  async updateProductRecommended(id, isRecommended) {
    const response = await apiFetch<ApiResponse<AdminProductRecord>>(`/products/${id}/recommended`, {
      method: "PUT",
      body: JSON.stringify({ isRecommended })
    });
    return unwrapApiResponse(response, "商品推荐状态更新失败");
  }
};
