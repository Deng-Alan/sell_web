"use client";

import { getStoredAdminAuthHeaders } from "@/lib/auth";
import { joinApiPath } from "@/lib/api-base";
import type { ApiResponse } from "@/types/api";

export type AdminUploadResult = {
  originalName: string;
  storedName: string;
  storagePath: string;
  url: string;
  size: number;
  contentType: string;
};

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

  const response = await fetch(joinApiPath("/admin/uploads/image"), {
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
