"use client";

import { getStoredAdminAuthHeaders } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export type AdminUploadResult = {
  originalName: string;
  storedName: string;
  storagePath: string;
  url: string;
  size: number;
  contentType: string;
};

function joinPath(path: string) {
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseApiResponse<T>(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return null;
  }
}

export async function uploadAdminImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(joinPath("/admin/uploads/image"), {
    method: "POST",
    body: formData,
    cache: "no-store",
    headers: {
      ...getStoredAdminAuthHeaders()
    }
  });

  const payload = await parseApiResponse<AdminUploadResult>(response);
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.message || `图片上传失败（${response.status}）`);
  }

  return payload.data;
}
