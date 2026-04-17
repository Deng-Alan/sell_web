import { apiFetch } from "@/lib/api";
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
  product: ShowcaseProductDetail;
  relatedProducts: ShowcaseProductCard[];
  categories: ShowcaseCategoryOption[];
  contacts: ShowcaseContactCard[];
  source: "api" | "fallback";
};

const FALLBACK_CATEGORIES: PublicCategoryRecord[] = [
  {
    id: 1,
    name: "账号资源",
    slug: "accounts",
    sortOrder: 1,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  },
  {
    id: 2,
    name: "工具软件",
    slug: "tools",
    sortOrder: 2,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  },
  {
    id: 3,
    name: "资料内容",
    slug: "data",
    sortOrder: 3,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  },
  {
    id: 4,
    name: "网站模板",
    slug: "web",
    sortOrder: 4,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  }
];

const FALLBACK_CONTACTS: PublicContactRecord[] = [
  {
    id: 1,
    type: "wechat",
    name: "微信客服",
    value: "wx-showcase-01",
    qrImage: null,
    jumpUrl: "https://example.com/contact/wechat",
    displayPlaces: "首页、详情页",
    sortOrder: 1,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  },
  {
    id: 2,
    type: "qq",
    name: "QQ 客服",
    value: "2088xxxx",
    qrImage: null,
    jumpUrl: "https://example.com/contact/qq",
    displayPlaces: "首页、列表页",
    sortOrder: 2,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  },
  {
    id: 3,
    type: "telegram",
    name: "Telegram",
    value: "@showcase_support",
    qrImage: null,
    jumpUrl: "https://t.me/showcase_support",
    displayPlaces: "详情页、联系区",
    sortOrder: 3,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  },
  {
    id: 4,
    type: "email",
    name: "邮箱",
    value: "support@example.com",
    qrImage: null,
    jumpUrl: "mailto:support@example.com",
    displayPlaces: "联系区",
    sortOrder: 4,
    status: 1,
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00"
  }
];

const FALLBACK_PRODUCTS: PublicProductRecord[] = [
  {
    id: 2401,
    categoryId: 1,
    categoryName: "账号资源",
    contactId: 1,
    contactName: "微信客服",
    name: "Alpha Gmail 资源包",
    coverImage: null,
    shortDesc: "高质量Gmail账号资源包，适合营销推广和业务拓展使用。",
    content:
      "精选优质Gmail账号资源，经过严格筛选和验证，确保账号质量和稳定性。支持批量购买，提供完善的售后服务。",
    price: 68,
    originalPrice: 88,
    stock: 24,
    isRecommended: 1,
    sortOrder: 1,
    status: 1,
    imageUrls: [],
    createdAt: "2026-04-15 10:20:00",
    updatedAt: "2026-04-15 10:20:00"
  },
  {
    id: 2402,
    categoryId: 2,
    categoryName: "工具软件",
    contactId: 3,
    contactName: "Telegram",
    name: "Beta 工具站套餐",
    coverImage: null,
    shortDesc: "专业工具软件套餐，包含多款实用工具，提升工作效率。",
    content: "精选多款专业工具软件，涵盖办公、设计、开发等多个领域。一次购买，长期使用，性价比高。提供详细使用教程和技术支持。",
    price: 128,
    originalPrice: 168,
    stock: 8,
    isRecommended: 1,
    sortOrder: 2,
    status: 1,
    imageUrls: [],
    createdAt: "2026-04-15 09:48:00",
    updatedAt: "2026-04-15 09:48:00"
  },
  {
    id: 2403,
    categoryId: 3,
    categoryName: "资料内容",
    contactId: 4,
    contactName: "邮箱",
    name: "Gamma 数据资料包",
    coverImage: null,
    shortDesc: "精选行业数据资料包，包含市场分析、行业报告等内容。",
    content: "汇集行业权威数据和深度分析报告，帮助您快速了解市场动态和行业趋势。内容持续更新，确保信息时效性。",
    price: 38,
    originalPrice: null,
    stock: 0,
    isRecommended: 0,
    sortOrder: 3,
    status: 1,
    imageUrls: [],
    createdAt: "2026-04-14 18:12:00",
    updatedAt: "2026-04-14 18:12:00"
  },
  {
    id: 2404,
    categoryId: 4,
    categoryName: "网站模板",
    contactId: 2,
    contactName: "QQ 客服",
    name: "Delta 展示站模板",
    coverImage: null,
    shortDesc: "精美网站展示模板，适合企业官网和产品展示使用。",
    content: "专业设计的网站模板，响应式布局，支持多种设备访问。包含完整的页面结构和组件，易于定制和维护。提供详细的使用文档和技术支持。",
    price: 198,
    originalPrice: 256,
    stock: 17,
    isRecommended: 0,
    sortOrder: 4,
    status: 1,
    imageUrls: [],
    createdAt: "2026-04-15 08:05:00",
    updatedAt: "2026-04-15 08:05:00"
  }
];

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

function formatDisplayPlaces(value: string | null | undefined) {
  if (!value) {
    return "人工咨询";
  }

  const labels = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      switch (item) {
        case "home":
          return "首页";
        case "product":
          return "商品页";
        case "detail":
          return "详情页";
        case "footer":
          return "页脚";
        default:
          return item;
      }
    });

  return labels.length > 0 ? labels.join(" / ") : "人工咨询";
}

function normalizeContact(record: PublicContactRecord): ShowcaseContactCard {
  const href = record.jumpUrl && record.jumpUrl.trim().length > 0 ? record.jumpUrl : `#contact-${record.id}`;
  return {
    id: String(record.id),
    label: record.name,
    value: record.value,
    hint: formatDisplayPlaces(record.displayPlaces),
    href,
    type: record.type || "contact",
    qrImage: record.qrImage
  };
}

function resolveContact(cards: ShowcaseContactCard[], contactId: number | null, contactName: string | null) {
  const byId = contactId ? cards.find((item) => item.id === String(contactId)) : undefined;
  if (byId) {
    return byId;
  }

  if (contactName) {
    const byLabel = cards.find((item) => item.label === contactName);
    if (byLabel) {
      return byLabel;
    }
  }

  return cards[0];
}

function normalizeProductCard(record: PublicProductRecord, contacts: ShowcaseContactCard[]): ShowcaseProductCard {
  const categoryName = record.categoryName || "未分类";
  const contact = resolveContact(contacts, record.contactId, record.contactName);
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
    contactHref: contact?.href ?? "#contact",
    badge: createBadge(record.name),
    coverTone: CATEGORY_TONES.get(categoryName) || pickTone(record.id.toString()),
    coverImage: record.coverImage
  };
}

function normalizeProductDetail(record: PublicProductRecord, contacts: ShowcaseContactCard[]): ShowcaseProductDetail {
  const card = normalizeProductCard(record, contacts);
  const contact = resolveContact(contacts, record.contactId, record.contactName);
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
    contactHint: contact?.hint ?? "支持人工咨询"
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
    const response = await apiFetch<ApiResponse<T[]>>(path);
    return response.data;
  } catch {
    return null;
  }
}

async function fetchPublicCollection<T>(path: string): Promise<PublicCollectionResult<T> | null> {
  try {
    const response = await apiFetch<ApiResponse<T[] | ApiListResponse<T>>>(path);
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
    const response = await apiFetch<ApiResponse<T>>(path);
    return response.data;
  } catch {
    return null;
  }
}

function buildRelatedProducts(products: ShowcaseProductCard[], currentProduct: ShowcaseProductCard) {
  return products
    .filter((product) => product.id !== currentProduct.id)
    .sort((left, right) => Number(right.featured) - Number(left.featured) || right.stock - left.stock || left.name.localeCompare(right.name))
    .slice(0, 3);
}

function buildFallbackProduct(id: string, contacts: ShowcaseContactCard[]) {
  const fallbackRecord = {
    ...FALLBACK_PRODUCTS[0],
    id: Number.isFinite(Number(id)) ? Number(id) : FALLBACK_PRODUCTS[0].id,
    name: `商品 ${id}`,
    shortDesc: `精选商品，编号 ${id}，欢迎咨询了解详情。`,
    content: `优质商品，提供专业的售前咨询和完善的售后服务。如需了解更多信息，请通过联系方式与我们沟通。`,
    contactId: FALLBACK_CONTACTS[0].id
  };

  return normalizeProductDetail(fallbackRecord, contacts);
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

  const categorySource = categoryRecords && categoryRecords.length > 0 ? categoryRecords : FALLBACK_CATEGORIES;
  const contactSource = contactRecords && contactRecords.length > 0 ? contactRecords : FALLBACK_CONTACTS;
  const productSource = productRecords ? productRecords.items : FALLBACK_PRODUCTS;

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
  const total = productRecords?.total ?? allProducts.length;
  const page = productRecords?.page ?? 1;
  const pageSize = productRecords?.pageSize ?? allProducts.length;

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

  const categorySource = categoryRecords && categoryRecords.length > 0 ? categoryRecords : FALLBACK_CATEGORIES;
  const contactSource = contactRecords && contactRecords.length > 0 ? contactRecords : FALLBACK_CONTACTS;
  const listSource = listRecords ? listRecords.items : FALLBACK_PRODUCTS;

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
      : buildFallbackProduct(id, contacts);

  const relatedProducts = buildRelatedProducts(allProducts, product);

  return {
    product,
    relatedProducts,
    categories,
    contacts,
    source: productRecords ? "api" : "fallback"
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}
