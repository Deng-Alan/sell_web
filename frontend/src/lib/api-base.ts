function normalizeBaseUrl(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  if (!normalized) {
    return fallback;
  }

  return normalized.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return normalizeBaseUrl(
      process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL,
      "http://localhost:8080/api"
    );
  }

  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL, "/api");
}

export function joinApiPath(path: string) {
  const apiBaseUrl = getApiBaseUrl();
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
