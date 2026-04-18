export type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T | null;
};

export type ApiListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  categoryId?: string;
  isRecommended?: string;
};

export type ApiErrorShape = {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type AdminDashboardStats = {
  totalProducts: number;
  activeProducts: number;
  recommendedProducts: number;
  totalCategories: number;
  activeCategories: number;
  totalContacts: number;
  activeContacts: number;
};
