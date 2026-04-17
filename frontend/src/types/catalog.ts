export type CategoryStatus = "enabled" | "disabled";

export type ProductStatus = "draft" | "published" | "archived";

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  sortOrder: number;
  status: CategoryStatus;
  updatedAt: string;
};

export type CategoryUpsertInput = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  status: CategoryStatus;
};

export type ProductListItem = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  updatedAt: string;
};

export type ProductDetail = ProductListItem & {
  coverImageUrl: string;
  galleryUrls: string[];
  summary: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  notes: string[];
};

export type ProductUpsertInput = {
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  coverImageUrl: string;
  galleryUrls: string[];
  summary: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  notes: string[];
};

export type CatalogListQuery = {
  keyword?: string;
  status?: CategoryStatus | ProductStatus | "all";
  categoryId?: string;
  page?: number;
  pageSize?: number;
};

export type CatalogSelectOption = {
  label: string;
  value: string;
};

export type AdminFlagValue = 0 | 1;

export type AdminCategoryRecord = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number | null;
  status: AdminFlagValue | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategoryOption = {
  label: string;
  value: string;
  slug: string;
  status: AdminFlagValue | null;
};

export type AdminContactRecord = {
  id: number;
  type: string | null;
  name: string;
  value: string;
  qrImage: string | null;
  jumpUrl: string | null;
  displayPlaces: string | null;
  sortOrder: number | null;
  status: AdminFlagValue | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductRecord = {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  contactId: number | null;
  contactName: string | null;
  name: string;
  coverImage: string | null;
  shortDesc: string | null;
  content: string | null;
  price: number | string | null;
  originalPrice: number | string | null;
  stock: number | null;
  isRecommended: AdminFlagValue | null;
  sortOrder: number | null;
  status: AdminFlagValue | null;
  imageUrls: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductQuery = {
  keyword?: string;
  categoryId?: string;
  status?: string;
  isRecommended?: string;
  page?: number;
  pageSize?: number;
};

export type AdminProductUpsertInput = {
  categoryId: number;
  name: string;
  coverImage?: string | null;
  shortDesc?: string | null;
  content?: string | null;
  price: number | string;
  originalPrice?: number | string | null;
  stock: number;
  contactId?: number | null;
  isRecommended?: AdminFlagValue | null;
  sortOrder?: number | null;
  status?: AdminFlagValue | null;
  imageUrls?: string[];
};

export type PublicCategoryRecord = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number | null;
  status: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicContactRecord = {
  id: number;
  type: string | null;
  name: string;
  value: string;
  qrImage: string | null;
  jumpUrl: string | null;
  displayPlaces: string | null;
  sortOrder: number | null;
  status: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicProductRecord = {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  contactId: number | null;
  contactName: string | null;
  name: string;
  coverImage: string | null;
  shortDesc: string | null;
  content: string | null;
  price: number | string | null;
  originalPrice: number | string | null;
  stock: number | null;
  isRecommended: number | null;
  sortOrder: number | null;
  status: number | null;
  imageUrls: string[] | null;
  createdAt: string;
  updatedAt: string;
};
