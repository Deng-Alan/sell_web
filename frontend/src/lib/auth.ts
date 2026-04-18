import type { AdminAuthSession, AdminLoginRequest, AdminLoginResponse } from "@/types/auth";
import { joinApiPath } from "@/lib/api-base";
import type { ApiResponse } from "@/types/api";

const adminAuthStorageKey = "sell-web-admin-auth";

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
    const session = JSON.parse(value) as Partial<AdminAuthSession>;

    if (!session?.token || !session.username) {
      return null;
    }

    return {
      token: session.token,
      username: session.username,
      nickname: session.nickname ?? session.username,
      loginAt: session.loginAt ?? new Date(0).toISOString(),
      rememberMe: Boolean(session.rememberMe)
    } satisfies AdminAuthSession;
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

export function hasStoredAdminAuthToken() {
  return Boolean(getStoredAdminAuthToken());
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

export async function logoutAdmin() {
  try {
    await fetch(joinApiPath("/auth/logout"), {
      method: "POST",
      headers: {
        ...getStoredAdminAuthHeaders()
      },
      cache: "no-store"
    });
  } catch {
    // noop
  } finally {
    clearStoredAdminAuth();
  }
}

export async function loginAdmin(input: AdminLoginRequest, rememberMe: boolean) {
  let response: Response;

  try {
    response = await fetch(joinApiPath("/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store",
      body: JSON.stringify(input)
    });
  } catch {
    throw new Error("无法连接后端服务，请确认 Spring Boot 服务已启动。");
  }

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
