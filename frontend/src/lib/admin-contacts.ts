import { apiFetch } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export type ContactStatusValue = 0 | 1;

export type ContactTypeValue = "wechat" | "qq" | "telegram" | "email" | "qr" | "link" | string;

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

  return {
    type: state.type.trim(),
    name: state.name.trim(),
    value: state.value.trim(),
    qrImage: trimOrNull(state.qrImage),
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
    case "telegram":
      return "Telegram";
    case "email":
      return "邮箱";
    case "qr":
      return "二维码";
    case "link":
      return "跳转链接";
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
  const contacts = unwrapApiResponse(response, "Failed to load contacts");

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

  return unwrapApiResponse(response, "Failed to create contact");
}

export async function updateAdminContact(id: number, state: ContactFormState) {
  const response = await apiFetch<ApiResponse<ContactRecord>>(`/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(buildContactPayload(state))
  });

  return unwrapApiResponse(response, "Failed to update contact");
}

export async function deleteAdminContact(id: number) {
  const response = await apiFetch<ApiResponse<void>>(`/contacts/${id}`, {
    method: "DELETE"
  });

  unwrapApiResponse(response, "Failed to delete contact");
}

export async function updateAdminContactStatus(id: number, status: ContactStatusValue) {
  const response = await apiFetch<ApiResponse<ContactRecord>>(`/contacts/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });

  return unwrapApiResponse(response, "Failed to update contact status");
}

export async function updateAdminContactSortOrder(id: number, sortOrder: number) {
  const response = await apiFetch<ApiResponse<ContactRecord>>(`/contacts/${id}/sort`, {
    method: "PUT",
    body: JSON.stringify({ sortOrder })
  });

  return unwrapApiResponse(response, "Failed to update contact sort order");
}
