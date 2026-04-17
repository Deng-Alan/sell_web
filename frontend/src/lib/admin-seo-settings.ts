import { getStoredAdminAuthHeaders } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
const seoGroupName = "seo";

function joinPath(path: string) {
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const seoRuleDefinitions = [
  {
    id: "home",
    pageName: "首页",
    route: "/",
    note: "首页首屏、品牌曝光与基础转化入口"
  },
  {
    id: "category",
    pageName: "分类页",
    route: "/products?category=",
    note: "承接搜索与分类筛选流量"
  },
  {
    id: "product",
    pageName: "商品详情",
    route: "/products/[id]",
    note: "商品落地页与咨询转化页"
  },
  {
    id: "admin",
    pageName: "后台页",
    route: "/admin/*",
    note: "默认不参与索引，避免后台被收录"
  }
] as const;

export type SeoRuleId = (typeof seoRuleDefinitions)[number]["id"];

export type SeoRuleFields = {
  titleTemplate: string;
  descriptionTemplate: string;
  keywords: string;
  robots: string;
};

export type SeoFormState = Record<SeoRuleId, SeoRuleFields>;

export type SeoSettingRecord = {
  id?: number | null;
  settingKey?: string | null;
  settingValue?: string | null;
  groupName?: string | null;
  updatedAt?: string | null;
};

export type SeoGroupLoadResult = {
  records: SeoSettingRecord[];
  state: SeoFormState;
};

const defaultRuleFields: SeoRuleFields = {
  titleTemplate: "",
  descriptionTemplate: "",
  keywords: "",
  robots: "index,follow"
};

const ruleKeyParts = {
  home: "home",
  category: "category",
  product: "product",
  admin: "admin"
} as const;

const fieldKeyMap = {
  titleTemplate: "titleTemplate",
  descriptionTemplate: "descriptionTemplate",
  keywords: "keywords",
  robots: "robots"
} as const;

function createDefaultRuleState(): SeoFormState {
  return {
    home: { ...defaultRuleFields },
    category: { ...defaultRuleFields },
    product: { ...defaultRuleFields },
    admin: { ...defaultRuleFields }
  };
}

function isRuleId(value: string): value is SeoRuleId {
  return value === "home" || value === "category" || value === "product" || value === "admin";
}

function normalizeValue(value: string | null | undefined) {
  return (value ?? "").trim();
}

function parseSettingKey(settingKey: string) {
  const parts = settingKey.split(".");
  if (parts.length < 3 || parts[0] !== "seo") {
    return null;
  }

  const ruleId = parts[1];
  const fieldKey = parts.slice(2).join(".");

  if (!isRuleId(ruleId)) {
    return null;
  }

  const resolvedFieldKey =
    fieldKey === "titleTemplate" || fieldKey === "descriptionTemplate" || fieldKey === "keywords" || fieldKey === "robots"
      ? fieldKey
      : null;

  if (!resolvedFieldKey) {
    return null;
  }

  return {
    ruleId,
    fieldKey: resolvedFieldKey
  };
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

async function requestSeoApi<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(joinPath(path), {
    ...init,
    cache: "no-store",
    headers: {
      ...getStoredAdminAuthHeaders(),
      ...(init.headers ?? {})
    }
  });

  const payload = await parseApiResponse<T>(response);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `请求失败：${response.status}`);
  }

  return payload.data as T;
}

export async function loadSeoSettings(): Promise<SeoGroupLoadResult> {
  const records = await requestSeoApi<SeoSettingRecord[]>(`/site-settings?groupName=${encodeURIComponent(seoGroupName)}`);
  return {
    records: records ?? [],
    state: mapSeoRecordsToState(records ?? [])
  };
}

export async function saveSeoSettings(state: SeoFormState) {
  const items = seoRuleDefinitions.flatMap((rule) => {
    const fields = state[rule.id];
    return (Object.entries(fields) as Array<[keyof SeoRuleFields, string]>).map(([fieldKey, fieldValue]) => ({
      settingKey: `seo.${ruleKeyParts[rule.id]}.${fieldKeyMap[fieldKey]}`,
      settingValue: normalizeValue(fieldValue),
      groupName: seoGroupName
    }));
  });

  return requestSeoApi<SeoSettingRecord[]>(`/site-settings/groups/${seoGroupName}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items })
  });
}

export function mapSeoRecordsToState(records: SeoSettingRecord[]) {
  const state = createDefaultRuleState();

  for (const record of records) {
    const key = record.settingKey?.trim();
    if (!key) {
      continue;
    }

    const parsed = parseSettingKey(key);
    if (!parsed) {
      continue;
    }

    state[parsed.ruleId][parsed.fieldKey as keyof SeoRuleFields] = record.settingValue ?? "";
  }

  return state;
}

export function createSeoSummary(state: SeoFormState) {
  return seoRuleDefinitions.map((rule) => {
    const fields = state[rule.id];
    const filledFieldCount = Object.values(fields).filter((value) => normalizeValue(value).length > 0).length;

    return {
      ...rule,
      filledFieldCount,
      totalFieldCount: 4,
      isComplete: filledFieldCount === 4,
      isEmpty: filledFieldCount === 0
    };
  });
}

export function createBlankSeoState() {
  return createDefaultRuleState();
}

export function getSeoMetricSnapshot(state: SeoFormState, records: SeoSettingRecord[]) {
  const summary = createSeoSummary(state);
  const totalFilled = summary.reduce((count, item) => count + item.filledFieldCount, 0);
  const completedRules = summary.filter((item) => item.isComplete).length;
  const emptyRules = summary.filter((item) => item.isEmpty).length;
  const latestUpdatedAt = records
    .map((record) => record.updatedAt ?? "")
    .filter(Boolean)
    .sort()
    .at(-1) || "";

  return {
    totalFilled,
    completedRules,
    emptyRules,
    latestUpdatedAt
  };
}
