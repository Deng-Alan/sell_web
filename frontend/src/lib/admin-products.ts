import { adminCatalogApi } from "@/lib/api";
import type {
  AdminCategoryOption,
  AdminCategoryRecord,
  AdminContactRecord,
  AdminFlagValue,
  AdminProductQuery,
  AdminProductRecord,
  AdminProductUpsertInput
} from "@/types/catalog";

export type AdminProductListFilters = {
  keyword: string;
  categoryId: string;
  status: string;
  isRecommended: string;
  page: number;
  pageSize: number;
};

export type AdminProductFormState = {
  categoryId: string;
  name: string;
  coverImage: string;
  shortDesc: string;
  content: string;
  price: string;
  originalPrice: string;
  stock: string;
  contactId: string;
  isRecommended: string;
  sortOrder: string;
  status: string;
  imageUrlsText: string;
};

export type AdminProductListViewModel = {
  categories: AdminCategoryOption[];
  products: AdminProductRecord[];
  total: number;
  page: number;
  pageSize: number;
  source: "api" | "fallback";
  error: string | null;
};

export type AdminProductEditorViewModel = {
  categories: AdminCategoryOption[];
  contacts: AdminContactRecord[];
  product: AdminProductRecord | null;
  source: "api" | "fallback";
  error: string | null;
};

function toOption(record: AdminCategoryRecord): AdminCategoryOption {
  return {
    label: record.name,
    value: String(record.id),
    slug: record.slug,
    status: record.status
  };
}

function normalizeCategoryOptions(records: AdminCategoryRecord[]) {
  return records
    .slice()
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.id - right.id)
    .map(toOption);
}

function normalizeProductQuery(filters: AdminProductListFilters): AdminProductQuery {
  return {
    keyword: filters.keyword.trim() || undefined,
    categoryId: filters.categoryId && filters.categoryId !== "all" ? filters.categoryId : undefined,
    status: filters.status && filters.status !== "all" ? filters.status : undefined,
    isRecommended: filters.isRecommended && filters.isRecommended !== "all" ? filters.isRecommended : undefined,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

function parseNumberInput(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? Number(trimmed) : null;
}

function parseIntegerInput(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? Number.parseInt(trimmed, 10) : null;
}

function normalizeProductFormState(product: AdminProductRecord | null): AdminProductFormState {
  return {
    categoryId: product?.categoryId != null ? String(product.categoryId) : "",
    name: product?.name ?? "",
    coverImage: product?.coverImage ?? "",
    shortDesc: product?.shortDesc ?? "",
    content: product?.content ?? "",
    price: product?.price != null ? String(product.price) : "",
    originalPrice: product?.originalPrice != null ? String(product.originalPrice) : "",
    stock: product?.stock != null ? String(product.stock) : "",
    contactId: product?.contactId != null ? String(product.contactId) : "",
    isRecommended: product?.isRecommended != null ? String(product.isRecommended) : "0",
    sortOrder: product?.sortOrder != null ? String(product.sortOrder) : "0",
    status: product?.status != null ? String(product.status) : "1",
    imageUrlsText: product?.imageUrls?.join("\n") ?? ""
  };
}

function normalizeFormPayload(state: AdminProductFormState): AdminProductUpsertInput {
  const categoryId = parseIntegerInput(state.categoryId);
  const price = parseNumberInput(state.price);
  const stock = parseIntegerInput(state.stock);

  if (categoryId == null || Number.isNaN(categoryId)) {
    throw new Error("请选择商品分类");
  }
  if (price == null || Number.isNaN(price)) {
    throw new Error("请输入正确的售价");
  }
  if (stock == null || Number.isNaN(stock)) {
    throw new Error("请输入正确的库存");
  }

  const originalPrice = parseNumberInput(state.originalPrice);
  const contactId = parseIntegerInput(state.contactId);
  const sortOrder = parseIntegerInput(state.sortOrder);
  const isRecommended = state.isRecommended === "1" ? 1 : 0;
  const status = state.status === "1" ? 1 : 0;
  const imageUrls = state.imageUrlsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    categoryId,
    name: state.name.trim(),
    coverImage: state.coverImage.trim() || null,
    shortDesc: state.shortDesc.trim() || null,
    content: state.content.trim() || null,
    price,
    originalPrice: originalPrice == null || Number.isNaN(originalPrice) ? null : originalPrice,
    stock,
    contactId: contactId == null || Number.isNaN(contactId) ? null : contactId,
    isRecommended,
    sortOrder: sortOrder == null || Number.isNaN(sortOrder) ? 0 : sortOrder,
    status,
    imageUrls
  };
}

function formatApiError(error: unknown) {
  return error instanceof Error ? error.message : "未知错误";
}

export function createEmptyProductFormState() {
  return normalizeProductFormState(null);
}

export function createProductFormState(product: AdminProductRecord | null) {
  return normalizeProductFormState(product);
}

export function formatProductMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "¥0.00";
  }

  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) {
    return "¥0.00";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatProductDateTime(value: string) {
  return value.replace("T", " ").slice(0, 19);
}

export function getProductStatusLabel(status: AdminFlagValue | null | undefined) {
  return status === 1 ? "可见" : "隐藏";
}

export function getRecommendationLabel(isRecommended: AdminFlagValue | null | undefined) {
  return isRecommended === 1 ? "推荐" : "普通";
}

export async function loadAdminProductList(filters: AdminProductListFilters): Promise<AdminProductListViewModel> {
  const normalizedQuery = normalizeProductQuery(filters);

  try {
    const [categories, products] = await Promise.all([
      adminCatalogApi.listCategories(),
      adminCatalogApi.listProducts(normalizedQuery)
    ]);

    return {
      categories: normalizeCategoryOptions(categories),
      products: products.items,
      total: products.total,
      page: products.page,
      pageSize: products.pageSize,
      source: "api",
      error: null
    };
  } catch (error) {
    return {
      categories: [],
      products: [],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
      source: "fallback",
      error: formatApiError(error)
    };
  }
}

export async function loadAdminProductEditor(productId?: string): Promise<AdminProductEditorViewModel> {
  try {
    const [categories, contacts, product] = await Promise.all([
      adminCatalogApi.listCategories(),
      adminCatalogApi.listContacts(),
      productId ? adminCatalogApi.getProduct(productId) : Promise.resolve(null)
    ]);

    return {
      categories: normalizeCategoryOptions(categories),
      contacts,
      product: product ?? null,
      source: "api",
      error: null
    };
  } catch (error) {
    return {
      categories: [],
      contacts: [],
      product: null,
      source: "fallback",
      error: formatApiError(error)
    };
  }
}

export async function saveAdminProduct(mode: "create" | "edit", id: string | null, state: AdminProductFormState) {
  const payload = normalizeFormPayload(state);

  if (mode === "create") {
    return adminCatalogApi.createProduct(payload);
  }

  if (!id) {
    throw new Error("缺少商品 ID");
  }

  return adminCatalogApi.updateProduct(id, payload);
}

export async function toggleAdminProductStatus(id: string, status: AdminFlagValue) {
  return adminCatalogApi.updateProductStatus(id, status);
}

export async function toggleAdminProductRecommendation(id: string, isRecommended: AdminFlagValue) {
  return adminCatalogApi.updateProductRecommended(id, isRecommended);
}

export async function deleteAdminProduct(id: string) {
  await adminCatalogApi.deleteProduct(id);
}
