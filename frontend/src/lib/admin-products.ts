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

const FALLBACK_CATEGORIES: AdminCategoryRecord[] = [
  { id: 1, name: "邮箱账号", slug: "mail-accounts", sortOrder: 10, status: 1, createdAt: "2026-04-15 09:00:00", updatedAt: "2026-04-15 09:00:00" },
  { id: 2, name: "社媒账号", slug: "social-accounts", sortOrder: 20, status: 1, createdAt: "2026-04-15 09:00:00", updatedAt: "2026-04-15 09:00:00" },
  { id: 3, name: "工具软件", slug: "software-tools", sortOrder: 30, status: 1, createdAt: "2026-04-15 09:00:00", updatedAt: "2026-04-15 09:00:00" }
];

const FALLBACK_CONTACTS: AdminContactRecord[] = [
  {
    id: 1,
    type: "wechat",
    name: "微信客服",
    value: "sell-web-support",
    qrImage: null,
    jumpUrl: null,
    displayPlaces: "product,home",
    sortOrder: 10,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  }
];

const FALLBACK_PRODUCTS: AdminProductRecord[] = [
  {
    id: 2401,
    categoryId: 1,
    categoryName: "邮箱账号",
    contactId: 1,
    contactName: "微信客服",
    name: "Gmail 资源包",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "可直接用于列表展示和后台编辑联调的占位商品。",
    content: "这里是商品详情正文，用于联调用的真实字段映射。",
    price: 18,
    originalPrice: 30,
    stock: 126,
    isRecommended: 1,
    sortOrder: 1,
    status: 1,
    imageUrls: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 10:22:00"
  },
  {
    id: 2402,
    categoryId: 2,
    categoryName: "社媒账号",
    contactId: 2,
    contactName: "Telegram",
    name: "Instagram 普通号",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
    shortDesc: "适合做编辑、上架、下架流程联调的第二条样例数据。",
    content: "这是一条用于后台测试的商品内容。",
    price: 32,
    originalPrice: 48,
    stock: 48,
    isRecommended: 0,
    sortOrder: 2,
    status: 1,
    imageUrls: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-04-14 09:00:00",
    updatedAt: "2026-04-14 19:08:00"
  },
  {
    id: 2403,
    categoryId: 3,
    categoryName: "工具软件",
    contactId: null,
    contactName: null,
    name: "工具软件下载包",
    coverImage: null,
    shortDesc: "下架状态样例。",
    content: "用于展示隐藏商品、下架动作和编辑回显。",
    price: 12,
    originalPrice: null,
    stock: 0,
    isRecommended: 0,
    sortOrder: 3,
    status: 0,
    imageUrls: [],
    createdAt: "2026-04-13 09:00:00",
    updatedAt: "2026-04-13 16:44:00"
  }
];

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

function matchesFallbackQuery(product: AdminProductRecord, filters: AdminProductListFilters) {
  if (filters.categoryId !== "all" && String(product.categoryId ?? "") !== filters.categoryId) {
    return false;
  }

  if (filters.status !== "all" && String(product.status ?? "") !== filters.status) {
    return false;
  }

  if (filters.isRecommended !== "all" && String(product.isRecommended ?? "") !== filters.isRecommended) {
    return false;
  }

  if (filters.keyword.trim()) {
    const keyword = filters.keyword.trim().toLowerCase();
    const name = (product.name ?? "").toLowerCase();
    const shortDesc = (product.shortDesc ?? "").toLowerCase();
    if (!name.includes(keyword) && !shortDesc.includes(keyword)) {
      return false;
    }
  }

  return true;
}

function sortFallbackProducts(products: AdminProductRecord[]) {
  return [...products].sort((left, right) => {
    const sortDelta = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    if (sortDelta !== 0) {
      return sortDelta;
    }

    return (right.id ?? 0) - (left.id ?? 0);
  });
}

function paginateFallbackProducts(products: AdminProductRecord[], filters: AdminProductListFilters) {
  const total = products.length;
  const page = Math.max(1, filters.page);
  const pageSize = Math.max(1, filters.pageSize);
  const fromIndex = Math.min((page - 1) * pageSize, total);
  const toIndex = Math.min(fromIndex + pageSize, total);

  return {
    items: products.slice(fromIndex, toIndex),
    total,
    page,
    pageSize
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
      categories: normalizeCategoryOptions(categories.length > 0 ? categories : FALLBACK_CATEGORIES),
      products: products.items,
      total: products.total,
      page: products.page,
      pageSize: products.pageSize,
      source: "api",
      error: null
    };
  } catch (error) {
    const fallbackProducts = paginateFallbackProducts(
      sortFallbackProducts(FALLBACK_PRODUCTS.filter((product) => matchesFallbackQuery(product, filters))),
      filters
    );

    return {
      categories: normalizeCategoryOptions(FALLBACK_CATEGORIES),
      products: fallbackProducts.items,
      total: fallbackProducts.total,
      page: fallbackProducts.page,
      pageSize: fallbackProducts.pageSize,
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
      categories: normalizeCategoryOptions(categories.length > 0 ? categories : FALLBACK_CATEGORIES),
      contacts: contacts.length > 0 ? contacts : FALLBACK_CONTACTS,
      product: product ?? null,
      source: "api",
      error: null
    };
  } catch (error) {
    const fallbackProduct = productId ? FALLBACK_PRODUCTS.find((item) => String(item.id) === productId) ?? null : null;

    return {
      categories: normalizeCategoryOptions(FALLBACK_CATEGORIES),
      contacts: FALLBACK_CONTACTS,
      product: fallbackProduct,
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
