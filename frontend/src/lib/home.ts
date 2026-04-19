import { apiFetch } from "@/lib/api";
import { PUBLIC_CACHE_TAGS, normalizeCacheKeys } from "@/lib/public-cache";
import type { ApiResponse } from "@/types/api";
import type {
  HomeChannel,
  HomeConfigData,
  HomeContact,
  HomeFeature,
  HomeMetric,
  HomePageContent,
  HomeSection,
  HomeStep,
  HomeNavLink
} from "@/types/home";

const emptyContent: HomePageContent = {
  brandName: "商品展示",
  heroBadge: "内容暂时不可用",
  heroKicker: "Content unavailable",
  heroLead: "首页内容暂未配置",
  heroAccent: "请稍后查看",
  heroDescription: "当前首页内容暂时不可用，请确认后端服务已启动，或后台已完成首页内容配置。",
  primaryCtaLabel: "查看商品",
  secondaryCtaLabel: "查看联系方式",
  navLinks: [
    { label: "商品", href: "/" },
    { label: "联系", href: "/contact" }
  ],
  metrics: [],
  features: [],
  workflowTitle: "暂无流程内容",
  workflowDescription: "后台配置完成后，这里会展示完整流程说明。",
  steps: [],
  channels: [],
  contactTitle: "暂无联系方式",
  contactDescription: "后台配置联系方式后，这里会展示可用的咨询入口。",
  contactActions: []
};

const heroKeyAliases = ["hero_banner", "hero", "banner", "main_hero", "home_hero"];
const workflowKeyAliases = ["workflow", "process", "steps", "flow"];
const contactKeyAliases = ["contact", "contacts", "contact_us", "reach_us"];

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function matchesAlias(value: string, aliases: string[]) {
  const normalized = normalizeKey(value);
  return aliases.some((alias) => normalized === alias || normalized.includes(alias));
}

function isVisibleSection(section: HomeSection) {
  return section.status === undefined || section.status === null || section.status === 1;
}

function getSettingValue(settings: HomeConfigData["siteSettings"], keys: string[]) {
  for (const key of keys) {
    const found = settings.find((item) => normalizeKey(item.settingKey) === normalizeKey(key));
    if (found?.settingValue?.trim()) {
      return found.settingValue.trim();
    }
  }

  return "";
}

function parseJsonRecord(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function pickSection(sections: HomeSection[], aliases: string[]) {
  return sections.find((section) => matchesAlias(section.sectionKey, aliases));
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildNavLinks() {
  return emptyContent.navLinks;
}

function buildMetrics(section: HomeSection | undefined) {
  const parsed = parseJsonRecord(section?.extraJson);
  const metrics = Array.isArray(parsed?.metrics) ? parsed.metrics : null;

  if (!metrics || metrics.length === 0) {
    return [];
  }

  return metrics.slice(0, 3).map((item, index) => {
    const candidate = item as Record<string, unknown>;
    return {
      value: toText(candidate.value) || String(index + 1),
      label: toText(candidate.label) || "未命名指标",
      detail: toText(candidate.detail) || "后台暂未填写指标说明"
    };
  });
}

function buildFeatures(sections: HomeSection[]) {
  const fallbackAccentOrder: HomeFeature["accent"][] = ["ink", "amber", "rust"];
  const featureSections = sections.filter(
    (section) =>
      !matchesAlias(section.sectionKey, heroKeyAliases) &&
      !matchesAlias(section.sectionKey, workflowKeyAliases) &&
      !matchesAlias(section.sectionKey, contactKeyAliases)
  );

  if (featureSections.length === 0) {
    return [];
  }

  return featureSections.slice(0, 3).map((section, index) => ({
    title: section.title?.trim() || "未命名模块",
    description: section.content?.trim() || "后台暂未填写模块说明",
    accent: fallbackAccentOrder[index % fallbackAccentOrder.length]
  }));
}

function buildSteps(section: HomeSection | undefined) {
  const parsed = parseJsonRecord(section?.extraJson);
  const steps = Array.isArray(parsed?.steps) ? parsed.steps : null;

  if (!steps || steps.length === 0) {
    return [];
  }

  return steps.slice(0, 3).map((item, index) => {
    const candidate = item as Record<string, unknown>;
    return {
      title: toText(candidate.title) || `步骤 ${index + 1}`,
      description: toText(candidate.description) || "后台暂未填写步骤说明"
    };
  });
}

function contactTypeLabel(type: string) {
  switch (type.trim().toLowerCase()) {
    case "wechat":
      return "微信";
    case "qq":
      return "QQ";
    case "phone":
      return "电话";
    case "email":
      return "邮箱";
    case "website":
      return "网站";
    default:
      return "联系";
  }
}

function buildContactHref(contact: HomeContact) {
  const jumpUrl = contact.jumpUrl?.trim();
  if (jumpUrl) {
    return jumpUrl;
  }

  const value = contact.value.trim();
  const type = contact.type.trim().toLowerCase();

  if (type === "email" && value) {
    return `mailto:${value}`;
  }

  if (type === "phone" && value) {
    return `tel:${value}`;
  }

  if ((type === "website" || value.startsWith("http://") || value.startsWith("https://")) && value) {
    return value;
  }

  return "#contact";
}

function buildChannels(contacts: HomeContact[]) {
  if (contacts.length === 0) {
    return [];
  }

  return contacts.slice(0, 3).map((contact) => ({
    label: contact.name?.trim() || contactTypeLabel(contact.type),
    hint: contact.value?.trim() || "在线咨询"
  }));
}

function buildContactActions(contacts: HomeContact[]) {
  if (contacts.length === 0) {
    return [];
  }

  return contacts.slice(0, 3).map((contact) => ({
    label: contact.name?.trim() || contactTypeLabel(contact.type),
    href: buildContactHref(contact)
  }));
}

function resolveHomeContent(config: HomeConfigData | null, contacts: HomeContact[]) {
  if (!config) {
    return emptyContent;
  }

  const siteSettings = config.siteSettings ?? [];
  const sections = (config.homeSections ?? []).filter(isVisibleSection).sort((a, b) => {
    const sortA = a.sortOrder ?? 0;
    const sortB = b.sortOrder ?? 0;
    return sortA - sortB;
  });

  const heroSection = pickSection(sections, heroKeyAliases);
  const workflowSection = pickSection(sections, workflowKeyAliases);
  const contactSection = pickSection(sections, contactKeyAliases);

  const brandName = getSettingValue(siteSettings, ["site_name", "site_title", "brand_name", "app_name"]) || emptyContent.brandName;
  const heroBadge =
    getSettingValue(siteSettings, ["home_hero_badge", "hero_badge", "home_badge"]) ||
    heroSection?.sectionKey ||
    emptyContent.heroBadge;
  const heroKicker = getSettingValue(siteSettings, ["home_hero_kicker", "hero_kicker", "site_kicker"]) || emptyContent.heroKicker;
  const heroLead =
    getSettingValue(siteSettings, ["home_hero_lead", "hero_lead", "home_lead"]) ||
    emptyContent.heroLead;
  const heroAccent =
    heroSection?.title?.trim() ||
    getSettingValue(siteSettings, ["home_hero_accent", "hero_accent", "home_title"]) ||
    emptyContent.heroAccent;
  const heroDescription =
    heroSection?.content?.trim() ||
    getSettingValue(siteSettings, ["home_hero_description", "hero_description", "site_description"]) ||
    emptyContent.heroDescription;
  const primaryCtaLabel =
    getSettingValue(siteSettings, ["home_primary_cta", "primary_cta", "hero_primary_cta"]) || emptyContent.primaryCtaLabel;
  const secondaryCtaLabel =
    getSettingValue(siteSettings, ["home_secondary_cta", "secondary_cta", "hero_secondary_cta"]) ||
    emptyContent.secondaryCtaLabel;
  const workflowTitle = workflowSection?.title?.trim() || emptyContent.workflowTitle;
  const workflowDescription =
    workflowSection?.content?.trim() || emptyContent.workflowDescription;
  const contactTitle = contactSection?.title?.trim() || emptyContent.contactTitle;
  const contactDescription = contactSection?.content?.trim() || emptyContent.contactDescription;

  return {
    brandName,
    heroBadge,
    heroKicker,
    heroLead,
    heroAccent,
    heroDescription,
    primaryCtaLabel,
    secondaryCtaLabel,
    navLinks: buildNavLinks(),
    metrics: buildMetrics(heroSection),
    features: buildFeatures(sections),
    workflowTitle,
    workflowDescription,
    steps: buildSteps(workflowSection),
    channels: buildChannels(contacts),
    contactTitle,
    contactDescription,
    contactActions: buildContactActions(contacts)
  };
}

function resolveHomeCacheTags(path: string) {
  if (path.startsWith("/public/home-config")) {
    return [PUBLIC_CACHE_TAGS.home, PUBLIC_CACHE_TAGS.site, PUBLIC_CACHE_TAGS.contacts];
  }

  if (path.startsWith("/public/contacts")) {
    return [PUBLIC_CACHE_TAGS.contacts];
  }

  return [];
}

async function readPublicResponse<T>(path: string) {
  const response = await apiFetch<ApiResponse<T>>(path, {
    next: {
      revalidate: 60,
      tags: normalizeCacheKeys(resolveHomeCacheTags(path))
    }
  });
  if (!response.success) {
    throw new Error(response.message || `API request failed: ${path}`);
  }

  return response.data ?? null;
}

export async function loadHomePageContent(): Promise<HomePageContent> {
  const [configResult, contactsResult] = await Promise.allSettled([
    readPublicResponse<HomeConfigData>("/public/home-config"),
    readPublicResponse<HomeContact[]>("/public/contacts")
  ]);

  const config = configResult.status === "fulfilled" ? configResult.value : null;
  const contacts = contactsResult.status === "fulfilled" ? contactsResult.value ?? [] : [];

  return resolveHomeContent(config, contacts);
}
