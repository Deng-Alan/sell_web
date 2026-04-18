"use client";

import { getStoredAdminAuthHeaders } from "@/lib/auth";
import { joinApiPath } from "@/lib/api-base";
import type { ApiResponse } from "@/types/api";

export type AdminSiteSettingRecord = {
  id: number;
  settingKey: string;
  settingValue: string | null;
  groupName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

async function requestAdminApi<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(joinApiPath(path), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...getStoredAdminAuthHeaders(),
      ...(init.headers ?? {})
    }
  });

  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as ApiResponse<T>) : null;

  if (!response.ok) {
    throw new Error(parsed?.message || `请求失败 (${response.status})`);
  }

  if (!parsed?.success) {
    throw new Error(parsed?.message || "请求失败");
  }

  return parsed.data as T;
}

export async function loadAdminSiteSettings(groupName?: string) {
  const query = groupName ? `?groupName=${encodeURIComponent(groupName)}` : "";
  return requestAdminApi<AdminSiteSettingRecord[]>(`/site-settings${query}`);
}

export async function saveAdminSiteSetting(settingKey: string, settingValue: string, groupName: string) {
  const trimmedKey = settingKey.trim();
  if (!trimmedKey) {
    throw new Error("settingKey 不能为空");
  }

  return requestAdminApi<AdminSiteSettingRecord>(`/site-settings/${encodeURIComponent(trimmedKey)}`, {
    method: "PUT",
    body: JSON.stringify({
      settingKey: trimmedKey,
      settingValue,
      groupName: groupName.trim() || null
    })
  });
}
