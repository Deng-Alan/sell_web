import { getStoredAdminAuthHeaders } from "@/lib/auth";
import { joinApiPath } from "@/lib/api-base";
import type { ApiResponse } from "@/types/api";

export type AdminHomeSettingFieldDef = {
  key: string;
  label: string;
  hint: string;
  placeholder: string;
  multiline?: boolean;
  rows?: number;
  wide?: boolean;
};

export type AdminHomeSettingGroupDef = {
  title: string;
  description: string;
  fields: AdminHomeSettingFieldDef[];
};

export type AdminHomeSettingsFormState = Record<string, string>;

export type AdminHomeSettingRecord = {
  id: number;
  settingKey: string;
  settingValue: string;
  groupName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminHomeSectionRecord = {
  id: number;
  sectionKey: string;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  extraJson: string | null;
  sortOrder: number | null;
  status: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminHomeSectionDraft = {
  title: string;
  content: string;
  imageUrl: string;
  extraJson: string;
  sortOrder: string;
  status: "0" | "1";
};

export type AdminHomeSettingsSnapshot = {
  source: "api" | "partial" | "fallback";
  errors: string[];
  siteSettings: AdminHomeSettingRecord[];
  homeSections: AdminHomeSectionRecord[];
};

export const homeSettingGroups: AdminHomeSettingGroupDef[] = [
  {
    title: "站点品牌",
    description: "这些字段会影响首页标题、品牌名和顶部基础文案。",
    fields: [
      {
        key: "site_name",
        label: "站点名称",
        hint: "用于后端标题、品牌识别和基础站点文案。",
        placeholder: "Sell Web"
      },
      {
        key: "site_title",
        label: "站点标题",
        hint: "用于浏览器标题和首页主标题联动。",
        placeholder: "商品展示网站"
      },
      {
        key: "site_subtitle",
        label: "站点副标题",
        hint: "用于补充首页顶部的副说明。",
        placeholder: "可持续更新的展示型站点"
      }
    ]
  },
  {
    title: "Hero 文案",
    description: "这组字段会直接对应首页首屏的标题、导语和按钮。",
    fields: [
      {
        key: "home_hero_badge",
        label: "首屏徽标",
        hint: "首页左上角的小标签文案。",
        placeholder: "基础版首页骨架"
      },
      {
        key: "home_hero_kicker",
        label: "首屏前缀",
        hint: "用于首屏标题前的小字强调。",
        placeholder: "Editorial Commerce Landing"
      },
      {
        key: "home_hero_lead",
        label: "首屏引导句",
        hint: "首屏标题第一段文案。",
        placeholder: "让商品展示像一本经过排版的目录"
      },
      {
        key: "home_title",
        label: "首屏主标题",
        hint: "对应首页的核心强调文字，也会被前台首页读取。",
        placeholder: "经过排版的目录"
      },
      {
        key: "home_hero_description",
        label: "首屏描述",
        hint: "首屏标题下方的主说明。",
        placeholder: "这里可以写首页主要卖点和承接方式。"
      },
      {
        key: "home_primary_cta",
        label: "主按钮文案",
        hint: "首屏主 CTA。",
        placeholder: "查看模块骨架"
      },
      {
        key: "home_secondary_cta",
        label: "次按钮文案",
        hint: "首屏副 CTA。",
        placeholder: "了解承接流程"
      }
    ]
  },
  {
    title: "视觉与通知",
    description: "这里保留图片地址和公告类字段，方便后续继续扩展。",
    fields: [
      {
        key: "home_hero_image",
        label: "首屏图片",
        hint: "首屏视觉图 URL。",
        placeholder: "https://..."
      },
      {
        key: "home_banner_image",
        label: "Banner 图片",
        hint: "首页横幅或活动图 URL。",
        placeholder: "https://..."
      },
      {
        key: "home_announcement",
        label: "首页公告",
        hint: "首页顶部公告或说明文案。",
        placeholder: "欢迎来到首页配置后台"
      },
      {
        key: "home_contact_hint",
        label: "联系引导",
        hint: "前台咨询按钮旁的辅助说明。",
        placeholder: "点击咨询后由人工继续承接"
      }
    ]
  }
];

export const homeSettingFields = homeSettingGroups.flatMap((group) => group.fields);

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(value && typeof value === "object" && "success" in value && "message" in value && "data" in value);
}

function buildHeaders() {
  return {
    "Content-Type": "application/json",
    ...getStoredAdminAuthHeaders()
  };
}

async function requestAdminApi<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(joinApiPath(path), {
    ...init,
    cache: "no-store",
    headers: {
      ...buildHeaders(),
      ...(init.headers ?? {})
    }
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    if (isApiResponse<T>(parsed)) {
      throw new Error(parsed.message || `请求失败 (${response.status})`);
    }

    throw new Error(`请求失败 (${response.status})`);
  }

  if (isApiResponse<T>(parsed)) {
    if (!parsed.success) {
      throw new Error(parsed.message || "请求失败");
    }

    return parsed.data ?? null;
  }

  return parsed as T;
}

function sortSections(items: AdminHomeSectionRecord[]) {
  return [...items].sort((left, right) => {
    const sortOrderDelta = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    if (sortOrderDelta !== 0) {
      return sortOrderDelta;
    }

    const updatedAtDelta = (left.updatedAt ?? "").localeCompare(right.updatedAt ?? "");
    if (updatedAtDelta !== 0) {
      return updatedAtDelta;
    }

    return left.sectionKey.localeCompare(right.sectionKey);
  });
}

export function createEmptyHomeSettingsFormState() {
  return homeSettingFields.reduce<AdminHomeSettingsFormState>((accumulator, field) => {
    accumulator[field.key] = "";
    return accumulator;
  }, {});
}

export function createHomeSettingsFormState(settings: AdminHomeSettingRecord[]) {
  const formState = createEmptyHomeSettingsFormState();
  for (const setting of settings) {
    formState[setting.settingKey] = normalizeText(setting.settingValue);
  }

  return formState;
}

export function createHomeSectionDraft(section?: AdminHomeSectionRecord): AdminHomeSectionDraft {
  return {
    title: normalizeText(section?.title),
    content: normalizeText(section?.content),
    imageUrl: normalizeText(section?.imageUrl),
    extraJson: normalizeText(section?.extraJson),
    sortOrder: section?.sortOrder == null ? "" : String(section.sortOrder),
    status: section?.status === 0 ? "0" : "1"
  };
}

export function sectionStatusLabel(status: number | null | undefined) {
  return status === 1 ? "显示" : "隐藏";
}

export function sectionStatusTone(status: number | null | undefined) {
  return status === 1 ? "enabled" : "disabled";
}

export function getHomeSettingValue(formState: AdminHomeSettingsFormState, key: string) {
  return normalizeText(formState[key]);
}

export async function loadAdminHomeSettings(): Promise<AdminHomeSettingsSnapshot> {
  const [settingsResult, sectionsResult] = await Promise.allSettled([
    requestAdminApi<AdminHomeSettingRecord[]>("/site-settings?groupName=home"),
    requestAdminApi<AdminHomeSectionRecord[]>("/home-sections")
  ]);

  const errors: string[] = [];
  const siteSettings = settingsResult.status === "fulfilled" ? settingsResult.value ?? [] : [];
  const homeSections = sectionsResult.status === "fulfilled" ? sectionsResult.value ?? [] : [];

  if (settingsResult.status === "rejected") {
    errors.push(settingsResult.reason instanceof Error ? settingsResult.reason.message : "读取站点设置失败");
  }
  if (sectionsResult.status === "rejected") {
    errors.push(sectionsResult.reason instanceof Error ? sectionsResult.reason.message : "读取首页区块失败");
  }

  const source: AdminHomeSettingsSnapshot["source"] =
    errors.length === 0 ? "api" : siteSettings.length > 0 || homeSections.length > 0 ? "partial" : "fallback";

  return {
    source,
    errors,
    siteSettings,
    homeSections: sortSections(homeSections)
  };
}

export async function saveHomeSiteSettings(formState: AdminHomeSettingsFormState) {
  const items = homeSettingFields.map((field) => ({
    settingKey: field.key,
    settingValue: normalizeText(formState[field.key]),
    groupName: "home"
  }));

  return requestAdminApi<AdminHomeSettingRecord[]>("/site-settings/groups/home", {
    method: "PUT",
    body: JSON.stringify({ items })
  });
}

export async function saveHomeSection(sectionKey: string, draft: AdminHomeSectionDraft) {
  const trimmedKey = normalizeText(sectionKey);
  if (!trimmedKey) {
    throw new Error("sectionKey 不能为空");
  }

  const sortOrder = normalizeText(draft.sortOrder);
  const parsedSortOrder = sortOrder ? Number(sortOrder) : null;
  if (sortOrder && Number.isNaN(parsedSortOrder)) {
    throw new Error("排序必须是数字");
  }

  const payload = {
    title: normalizeText(draft.title) || null,
    content: normalizeText(draft.content) || null,
    imageUrl: normalizeText(draft.imageUrl) || null,
    extraJson: normalizeText(draft.extraJson) || null,
    sortOrder: parsedSortOrder,
    status: Number(draft.status) as 0 | 1
  };

  return requestAdminApi<AdminHomeSectionRecord>(`/home-sections/${encodeURIComponent(trimmedKey)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteHomeSection(sectionKey: string) {
  const trimmedKey = normalizeText(sectionKey);
  if (!trimmedKey) {
    throw new Error("sectionKey 不能为空");
  }

  await requestAdminApi<void>(`/home-sections/${encodeURIComponent(trimmedKey)}`, {
    method: "DELETE"
  });
}
