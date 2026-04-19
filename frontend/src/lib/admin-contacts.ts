import { apiFetch } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export type ContactStatusValue = 0 | 1;

export type ContactTypeValue = "wechat" | "qq" | "phone" | "email" | "website" | "telegram" | "qr" | "link" | "other" | string;

export type ContactRecord = {
  id: number;
  type: ContactTypeValue | null;
  name: string;
  value: string;
  qrImage: string | null;
  jumpUrl: string | null;
  displayPlaces: string | null;
  sortOrder: number | null;
  status: ContactStatusValue | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactListFilters = {
  keyword: string;
  type: string;
  status: string;
};

export type ContactFormState = {
  type: string;
  name: string;
  value: string;
  qrImage: string;
  jumpUrl: string;
  displayPlaces: string;
  sortOrder: string;
  status: string;
};

export type ContactUpsertInput = {
  type: string;
  name: string;
  value: string;
  qrImage: string | null;
  jumpUrl: string | null;
  displayPlaces: string | null;
  sortOrder: number | null;
  status: ContactStatusValue | null;
};

export type ContactListViewModel = {
  contacts: ContactRecord[];
  source: "api";
};

const PUBLIC_UPLOAD_PATH_PREFIX = "/api/admin/uploads/files/";
const BLOCKED_QR_IMAGE_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "backend"]);
const QR_IMAGE_ERROR_MESSAGE = "二维码图片必须使用站内上传地址或公开可访问的 http/https 地址";

function unwrapApiResponse<T>(response: ApiResponse<T>, fallbackMessage: string) {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.data as T;
}

function parseInteger(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function trimOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function validateQrImage(value: string | null) {
  if (!value) {
    return;
  }

  if (value.startsWith(PUBLIC_UPLOAD_PATH_PREFIX)) {
    return;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(QR_IMAGE_ERROR_MESSAGE);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(QR_IMAGE_ERROR_MESSAGE);
  }

  if (BLOCKED_QR_IMAGE_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error("二维码图片不能使用本机或内网地址，请改用站内上传地址或公开域名");
  }
}

export function createEmptyContactFormState(): ContactFormState {
  return {
    type: "wechat",
    name: "",
    value: "",
    qrImage: "",
    jumpUrl: "",
    displayPlaces: "home,product",
    sortOrder: "0",
    status: "1"
  };
}

export function createContactFormState(contact: ContactRecord | null): ContactFormState {
  if (!contact) {
    return createEmptyContactFormState();
  }

  return {
    type: contact.type ?? "wechat",
    name: contact.name,
    value: contact.value,
    qrImage: contact.qrImage ?? "",
    jumpUrl: contact.jumpUrl ?? "",
    displayPlaces: contact.displayPlaces ?? "",
    sortOrder: contact.sortOrder != null ? String(contact.sortOrder) : "0",
    status: contact.status === 0 ? "0" : "1"
  };
}

export function buildContactPayload(state: ContactFormState): ContactUpsertInput {
  const sortOrder = parseInteger(state.sortOrder);
  const status = state.status === "0" ? 0 : 1;
  const qrImage = trimOrNull(state.qrImage);

  validateQrImage(qrImage);

  return {
    type: state.type.trim(),
    name: state.name.trim(),
    value: state.value.trim(),
    qrImage,
    jumpUrl: trimOrNull(state.jumpUrl),
    displayPlaces: trimOrNull(state.displayPlaces),
    sortOrder,
    status
  };
}

export function formatContactStatus(status: ContactStatusValue | null | undefined) {
  return status === 1 ? "启用" : "停用";
}

export function getContactStatusKey(status: ContactStatusValue | null | undefined) {
  return status === 1 ? "enabled" : "disabled";
}

export function formatContactType(type: string | null | undefined) {
  switch (type) {
    case "wechat":
      return "微信";
    case "qq":
      return "QQ";
    case "phone":
      return "电话";
    case "telegram":
      return "Telegram";
    case "email":
      return "邮箱";
    case "website":
      return "网站";
    case "qr":
      return "二维码";
    case "link":
      return "跳转链接";
    case "other":
      return "其他";
    default:
      return type || "未分类";
  }
}

export function splitDisplayPlaces(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,，|/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildContactKeyword(contact: ContactRecord) {
  return [contact.name, contact.value, contact.type, contact.jumpUrl, contact.displayPlaces, contact.qrImage]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export async function loadAdminContacts(): Promise<ContactListViewModel> {
  const response = await apiFetch<ApiResponse<ContactRecord[]>>("/contacts");
  const contacts = unwrapApiResponse(response, "联系人加载失败");

  return {
    contacts: Array.isArray(contacts) ? contacts : [],
    source: "api"
  };
}

export async function createAdminContact(state: ContactFormState) {
  const response = await apiFetch<ApiResponse<ContactRecord>>("/contacts", {
    method: "POST",
    body: JSON.stringify(buildContactPayload(state))
  });

  return unwrapApiResponse(response, "联系人创建失败");
}

export async function updateAdminContact(id: number, state: ContactFormState) {
  const response = await apiFetch<ApiResponse<ContactRecord>>(`/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(buildContactPayload(state))
  });

  return unwrapApiResponse(response, "联系人更新失败");
}

export async function deleteAdminContact(id: number) {
  const response = await apiFetch<ApiResponse<void>>(`/contacts/${id}`, {
    method: "DELETE"
  });

  unwrapApiResponse(response, "联系人删除失败");
}

export async function updateAdminContactStatus(id: number, status: ContactStatusValue) {
  const response = await apiFetch<ApiResponse<ContactRecord>>(`/contacts/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });

  return unwrapApiResponse(response, "联系人状态更新失败");
}

export async function updateAdminContactSortOrder(id: number, sortOrder: number) {
  const response = await apiFetch<ApiResponse<ContactRecord>>(`/contacts/${id}/sort`, {
    method: "PUT",
    body: JSON.stringify({ sortOrder })
  });

  return unwrapApiResponse(response, "联系人排序更新失败");
}
