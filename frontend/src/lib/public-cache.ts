export const PUBLIC_CACHE_TAGS = {
  products: "public:products",
  categories: "public:categories",
  contacts: "public:contacts",
  home: "public:home",
  site: "public:site"
} as const;

export function normalizeCacheKeys(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim() ?? "").filter(Boolean))];
}
