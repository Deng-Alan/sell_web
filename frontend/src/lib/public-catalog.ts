import { apiFetch } from "@/lib/api";
import { PUBLIC_CACHE_TAGS, normalizeCacheKeys } from "@/lib/public-cache";
import type { ApiListResponse, ApiResponse } from "@/types/api";
import type { PublicCategoryRecord, PublicContactRecord, PublicProductRecord } from "@/types/catalog";

export type ShowcaseCategoryOption = {
  label: string;
  value: string;
  slug: string;
};

export type ShowcaseContactCard = {
  id: string;
  label: string;
  value: string;
  hint: string;
  href: string;
  type: string;
  qrImage?: string | null;
  displayPlaces: string[];
};

export type ShowcaseProductCard = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  status: "published" | "archived";
  featured: boolean;
  updatedAt: string;
  summary: string;
  tags: string[];
  contactHref: string;
  badge: string;
  coverTone: string;
  coverImage?: string | null;
};

export type ShowcaseProductDetail = ShowcaseProductCard & {
  description: string;
  notes: string[];
  galleryUrls: string[];
  seoTitle: string;
  seoDescription: string;
  contactName: string;
  contactValue: string;
  contactHint: string;
};

export type PublicCatalogQuery = {
  keyword?: string;
  categoryId?: string;
  stock?: string;
  page?: string;
  pageSize?: string;
};

type PublicCollectionResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PublicCatalogData = {
  products: ShowcaseProductCard[];
  categories: ShowcaseCategoryOption[];
  contacts: ShowcaseContactCard[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  stats: {
    totalProducts: number;
    visibleProducts: number;
    totalStock: number;
    featuredCount: number;
    soldOutCount: number;
  };
  source: "api" | "fallback";
};

export type PublicProductPageData = {
  product: ShowcaseProductDetail | null;
  relatedProducts: ShowcaseProductCard[];
  categories: ShowcaseCategoryOption[];
  contacts: ShowcaseContactCard[];
  source: "api" | "fallback";
};

const COVER_TONES = [
  "linear-gradient(135deg, #1d1511, #16211d, #22382f)",
  "linear-gradient(135deg, #a94f1d, #8c3f22, #1f1f1f)",
  "linear-gradient(135deg, #315b4a, #27463a, #13201c)",
  "linear-gradient(135deg, #4b3527, #2b231d, #1c1816)"
];

const CATEGORY_TONES = new Map<string, string>([
  ["账号资源", COVER_TONES[0]],
  ["工具软件", COVER_TONES[1]],
  ["资料内容", COVER_TONES[2]],
  ["网站模板", COVER_TONES[3]]
]);
const PUBLIC_DATA_REVALIDATE_SECONDS = 60;

function buildQueryString(params?: Record<string, string | undefined>) {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }
    searchParams.set(key, value);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function clampText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function toFlag(value: number | null | undefined) {
  return value === 1;
}

function makeSku(id: string) {
  return `SKU-${id}`.toUpperCase();
}

function createBadge(name: string) {
  const normalized = name.trim();
  if (!normalized) {
    return "SP";
  }

  const letters = normalized.replace(/\s+/g, "");
  return clampText(letters, 2).toUpperCase();
}

function pickTone(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % COVER_TONES.length;
  }
  return COVER_TONES[Math.abs(hash)];
}

function normalizeCategory(record: PublicCategoryRecord): ShowcaseCategoryOption {
  return {
    label: record.name,
    value: String(record.id),
    slug: record.slug
  };
}

function parseDisplayPlaces(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,，|/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDisplayPlaces(value: string | null | undefined) {
  const places = parseDisplayPlaces(value);
  return places.length > 0 ? `展示位置：${places.join(" / ")}` : "在线咨询";
}

function isUrl(value: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(value);
}

function normalizeTelegram(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (isUrl(trimmed)) {
    return trimmed;
  }
  return `https://t.me/${trimmed.replace(/^@/, "")}`;
}

function buildContactHref(record: PublicContactRecord) {
  const jumpUrl = record.jumpUrl?.trim();
  if (jumpUrl) {
    return jumpUrl;
  }

  const value = record.value?.trim() ?? "";
  if (!value) {
    return `#contact-${record.id}`;
  }

  switch (record.type) {
    case "email":
      return isUrl(value) ? value : `mailto:${value}`;
    case "phone":
      return isUrl(value) ? value : `tel:${value}`;
    case "website":
    case "link":
      return isUrl(value) ? value : `#contact-${record.id}`;
    case "telegram":
      return normalizeTelegram(value);
    default:
      return `#contact-${record.id}`;
  }
}

function normalizeContact(record: PublicContactRecord): ShowcaseContactCard {
  return {
    id: String(record.id),
    label: record.name,
    value: record.value,
    hint: formatDisplayPlaces(record.displayPlaces),
    href: buildContactHref(record),
    type: record.type || "contact",
    qrImage: record.qrImage,
    displayPlaces: parseDisplayPlaces(record.displayPlaces)
  };
}

function isContactVisibleAt(contact: ShowcaseContactCard, place: string) {
  return contact.displayPlaces.length === 0 || contact.displayPlaces.includes(place);
}

function resolveContact(cards: ShowcaseContactCard[], contactId: number | null, contactName: string | null, place: string) {
  const visibleCards = cards.filter((item) => isContactVisibleAt(item, place));
  const byId = contactId ? visibleCards.find((item) => item.id === String(contactId)) : undefined;
  if (byId) {
    return byId;
  }

  if (contactName) {
    const byLabel = visibleCards.find((item) => item.label === contactName);
    if (byLabel) {
      return byLabel;
    }
  }

  return undefined;
}

function normalizeProductCard(record: PublicProductRecord, contacts: ShowcaseContactCard[], contactPlace = "product"): ShowcaseProductCard {
  const categoryName = record.categoryName || "未分类";
  const contact = resolveContact(contacts, record.contactId, record.contactName, contactPlace);
  const stock = Math.max(0, Math.floor(toNumber(record.stock, 0)));
  const price = toNumber(record.price, 0);
  const originalPrice = record.originalPrice == null ? null : toNumber(record.originalPrice, 0);
  const summarySource = record.shortDesc || record.content || `查看 ${record.name} 的商品信息和联系入口。`;

  return {
    id: String(record.id),
    name: record.name,
    sku: makeSku(String(record.id)),
    categoryId: String(record.categoryId ?? ""),
    categoryName,
    price,
    originalPrice,
    stock,
    status: toFlag(record.status) ? "published" : "archived",
    featured: toFlag(record.isRecommended),
    updatedAt: record.updatedAt,
    summary: clampText(summarySource.replace(/\s+/g, " ").trim(), 78),
    tags: [
      categoryName,
      toFlag(record.isRecommended) ? "推荐位" : "常规位",
      stock > 0 ? `${stock} 件库存` : "售罄"
    ],
    contactHref: contact?.href ?? "/contact",
    badge: createBadge(record.name),
    coverTone: CATEGORY_TONES.get(categoryName) || pickTone(record.id.toString()),
    coverImage: record.coverImage
  };
}

function normalizeProductDetail(record: PublicProductRecord, contacts: ShowcaseContactCard[]): ShowcaseProductDetail {
  const card = normalizeProductCard(record, contacts, "detail");
  const contact = resolveContact(contacts, record.contactId, record.contactName, "detail");
  const notes = [
    record.shortDesc ? `短说明：${record.shortDesc}` : "支持前台展示和咨询承接",
    record.content ? `内容摘要：${clampText(record.content.replace(/\s+/g, " ").trim(), 36)}` : "详情区已保留富文本承载位",
    `更新时间：${record.updatedAt}`,
    contact ? `联系方式：${contact.label}` : "支持人工咨询"
  ];

  return {
    ...card,
    description: record.content || record.shortDesc || card.summary,
    notes,
    galleryUrls: (record.imageUrls || []).filter(Boolean),
    seoTitle: `${record.name} | 商品详情`,
    seoDescription: clampText(
      record.shortDesc || record.content || `${record.name} 的价格、库存、联系入口和详情说明。`,
      120
    ),
    contactName: contact?.label ?? record.contactName ?? "联系入口",
    contactValue: contact?.value ?? record.contactName ?? "未配置",
    contactHint: contact?.hint ?? "查看联系方式页面获取可用咨询渠道"
  };
}

function applyCatalogFilters(products: ShowcaseProductCard[], query: PublicCatalogQuery) {
  const keyword = query.keyword?.trim().toLowerCase() ?? "";
  const categoryId = query.categoryId?.trim() ?? "";
  const stockFilter = query.stock?.trim() ?? "";

  return products.filter((product) => {
    const matchesKeyword =
      !keyword ||
      product.name.toLowerCase().includes(keyword) ||
      product.sku.toLowerCase().includes(keyword) ||
      product.summary.toLowerCase().includes(keyword);
    const matchesCategory = !categoryId || categoryId === "all" || product.categoryId === categoryId;
    const matchesStock =
      !stockFilter ||
      stockFilter === "all" ||
      (stockFilter === "in-stock" && product.stock > 0) ||
      (stockFilter === "low-stock" && product.stock > 0 && product.stock <= 10) ||
      (stockFilter === "sold-out" && product.stock === 0);

    return matchesKeyword && matchesCategory && matchesStock;
  });
}

async function fetchPublicArray<T>(path: string) {
  try {
    const response = await apiFetch<ApiResponse<T[]>>(path, {
      next: {
        revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
        tags: resolvePublicCacheTags(path)
      }
    });
    return response.data;
  } catch {
    return null;
  }
}

async function fetchPublicCollection<T>(path: string): Promise<PublicCollectionResult<T> | null> {
  try {
    const response = await apiFetch<ApiResponse<T[] | ApiListResponse<T>>>(path, {
      next: {
        revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
        tags: resolvePublicCacheTags(path)
      }
    });
    const data = response.data;
    if (!data) {
      return null;
    }
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        page: 1,
        pageSize: data.length
      };
    }
    return {
      items: Array.isArray(data.items) ? data.items : [],
      total: typeof data.total === "number" ? data.total : 0,
      page: typeof data.page === "number" ? data.page : 1,
      pageSize: typeof data.pageSize === "number" ? data.pageSize : Array.isArray(data.items) ? data.items.length : 0
    };
  } catch {
    return null;
  }
}

async function fetchPublicItem<T>(path: string) {
  try {
    const response = await apiFetch<ApiResponse<T>>(path, {
      next: {
        revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
        tags: resolvePublicCacheTags(path)
      }
    });
    return response.data;
  } catch {
    return null;
  }
}

function resolvePublicCacheTags(path: string) {
  if (path.startsWith("/public/products/")) {
    const productId = path.split("/").pop();
    return normalizeCacheKeys([
      PUBLIC_CACHE_TAGS.products,
      PUBLIC_CACHE_TAGS.categories,
      PUBLIC_CACHE_TAGS.contacts,
      productId ? `public:product:${productId}` : null
    ]);
  }

  if (path.startsWith("/public/products")) {
    return [PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.categories, PUBLIC_CACHE_TAGS.contacts];
  }

  if (path.startsWith("/public/categories")) {
    return [PUBLIC_CACHE_TAGS.categories];
  }

  if (path.startsWith("/public/contacts")) {
    return [PUBLIC_CACHE_TAGS.contacts];
  }

  if (path.startsWith("/public/home-config")) {
    return [PUBLIC_CACHE_TAGS.home, PUBLIC_CACHE_TAGS.site, PUBLIC_CACHE_TAGS.contacts];
  }

  return [];
}

function buildRelatedProducts(products: ShowcaseProductCard[], currentProduct: ShowcaseProductCard) {
  return products
    .filter((product) => product.id !== currentProduct.id)
    .sort((left, right) => Number(right.featured) - Number(left.featured) || right.stock - left.stock || left.name.localeCompare(right.name))
    .slice(0, 3);
}

export async function loadPublicCatalog(query: PublicCatalogQuery = {}): Promise<PublicCatalogData> {
  const [categoryRecords, contactRecords, productRecords] = await Promise.all([
    fetchPublicArray<PublicCategoryRecord>("/public/categories"),
    fetchPublicArray<PublicContactRecord>("/public/contacts"),
    fetchPublicCollection<PublicProductRecord>(
      `/public/products${buildQueryString({
        keyword: query.keyword,
        categoryId: query.categoryId,
        page: query.page,
        pageSize: query.pageSize
      })}`
    )
  ]);

  const categorySource = categoryRecords ?? [];
  const contactSource = contactRecords ?? [];
  const productSource = productRecords?.items ?? [];

  const categories = categorySource
    .filter((record) => toFlag(record.status))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.id - right.id)
    .map(normalizeCategory);

  const contacts = contactSource
    .filter((record) => toFlag(record.status))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.id - right.id)
    .map(normalizeContact);

  const allProducts = productSource
    .map((record) => normalizeProductCard(record, contacts))
    .sort((left, right) => {
      const orderDelta = Number(left.featured) - Number(right.featured);
      if (orderDelta !== 0) {
        return orderDelta * -1;
      }
      return right.stock - left.stock || left.name.localeCompare(right.name);
    });

  const products = applyCatalogFilters(allProducts, query);
  const totalStock = allProducts.reduce((sum, product) => sum + product.stock, 0);
  const currentPage = Math.max(1, Number(query.page || "1") || 1);
  const currentPageSize = Math.max(1, Number(query.pageSize || "9") || 9);
  const total = productRecords?.total ?? 0;
  const page = productRecords?.page ?? currentPage;
  const pageSize = productRecords?.pageSize ?? currentPageSize;

  return {
    products,
    categories,
    contacts,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
    },
    stats: {
      totalProducts: total,
      visibleProducts: query.stock ? products.length : total,
      totalStock,
      featuredCount: allProducts.filter((product) => product.featured).length,
      soldOutCount: allProducts.filter((product) => product.stock === 0).length
    },
    source: productRecords ? "api" : "fallback"
  };
}

export async function loadPublicProductPage(id: string): Promise<PublicProductPageData> {
  const [categoryRecords, contactRecords, productRecords, listRecords] = await Promise.all([
    fetchPublicArray<PublicCategoryRecord>("/public/categories"),
    fetchPublicArray<PublicContactRecord>("/public/contacts"),
    fetchPublicItem<PublicProductRecord>(`/public/products/${encodeURIComponent(id)}`),
    fetchPublicCollection<PublicProductRecord>("/public/products?page=1&pageSize=100")
  ]);

  const categorySource = categoryRecords ?? [];
  const contactSource = contactRecords ?? [];
  const listSource = listRecords?.items ?? [];

  const categories = categorySource
    .filter((record) => toFlag(record.status))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.id - right.id)
    .map(normalizeCategory);

  const contacts = contactSource
    .filter((record) => toFlag(record.status))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.id - right.id)
    .map(normalizeContact);

  const allProducts = listSource
    .map((record) => normalizeProductCard(record, contacts))
    .sort((left, right) => {
      const orderDelta = Number(left.featured) - Number(right.featured);
      if (orderDelta !== 0) {
        return orderDelta * -1;
      }
      return right.stock - left.stock || left.name.localeCompare(right.name);
    });

  const matchedListRecord = listSource.find((record) => String(record.id) === id);
  const product = productRecords
    ? normalizeProductDetail(productRecords, contacts)
    : matchedListRecord
      ? normalizeProductDetail(matchedListRecord, contacts)
      : null;

  const relatedProducts = product ? buildRelatedProducts(allProducts, product) : [];

  return {
    product,
    relatedProducts,
    categories,
    contacts,
    source: product || listRecords ? "api" : "fallback"
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}
