import type { AdminAuthSession, AdminLoginRequest, AdminLoginResponse } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
const adminAuthStorageKey = "sell-web-admin-auth";

function joinPath(path: string) {
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readStorage(storage: Storage | undefined) {
  if (!storage) {
    return null;
  }

  const value = storage.getItem(adminAuthStorageKey);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AdminAuthSession;
  } catch {
    return null;
  }
}

async function parseJsonResponse<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function getStoredAdminAuth(): AdminAuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  return readStorage(window.localStorage) ?? readStorage(window.sessionStorage);
}

export function getStoredAdminAuthToken() {
  return getStoredAdminAuth()?.token ?? null;
}

export function getStoredAdminProfile() {
  const auth = getStoredAdminAuth();
  if (!auth) {
    return null;
  }

  return {
    username: auth.username,
    nickname: auth.nickname,
    loginAt: auth.loginAt,
    rememberMe: auth.rememberMe
  };
}

export function setStoredAdminAuth(session: AdminAuthSession) {
  if (!canUseStorage()) {
    return;
  }

  if (session.rememberMe) {
    window.localStorage.setItem(adminAuthStorageKey, JSON.stringify(session));
    window.sessionStorage.removeItem(adminAuthStorageKey);
    return;
  }

  window.sessionStorage.setItem(adminAuthStorageKey, JSON.stringify(session));
  window.localStorage.removeItem(adminAuthStorageKey);
}

export function clearStoredAdminAuth() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(adminAuthStorageKey);
  window.sessionStorage.removeItem(adminAuthStorageKey);
}

export function getStoredAdminAuthHeaders(): Record<string, string> {
  const token = getStoredAdminAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginAdmin(input: AdminLoginRequest, rememberMe: boolean) {
  const response = await fetch(joinPath("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store",
    body: JSON.stringify(input)
  });

  const payload = await parseJsonResponse<ApiResponse<AdminLoginResponse>>(response);

  if (!response.ok) {
    throw new Error(payload?.message || `登录失败（${response.status}）`);
  }

  if (!payload?.success || !payload.data?.token) {
    throw new Error(payload?.message || "登录失败，请检查账号和密码");
  }

  const session: AdminAuthSession = {
    token: payload.data.token,
    username: payload.data.username,
    nickname: payload.data.nickname,
    loginAt: new Date().toISOString(),
    rememberMe
  };

  setStoredAdminAuth(session);
  return session;
}
