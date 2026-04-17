import { apiFetch } from "@/lib/api";
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

const fallbackNavLinks: HomeNavLink[] = [
  { label: "视觉", href: "#hero" },
  { label: "模块", href: "#modules" },
  { label: "流程", href: "#workflow" },
  { label: "联系", href: "#contact" }
];

const fallbackMetrics: HomeMetric[] = [
  {
    value: "3",
    label: "主视觉层",
    detail: "首屏、内容模块、联系承接三层结构，适合后续持续扩展。"
  },
  {
    value: "2",
    label: "转化入口",
    detail: "咨询按钮与联系区分层放置，保证路径清晰、不打断浏览。"
  },
  {
    value: "100%",
    label: "可配置",
    detail: "首页文案、联系方式、SEO 与推荐内容都预留后台接入位。"
  }
];

const fallbackFeatures: HomeFeature[] = [
  {
    title: "编辑部式首屏",
    description: "用大标题、留白和深浅对比建立第一印象，首页先传达品牌气质，再承接具体信息。",
    accent: "ink"
  },
  {
    title: "商品展示模块",
    description: "信息区以卡片和分栏组织，方便持续更新商品图、标签、价格和描述而不破坏版式。",
    accent: "amber"
  },
  {
    title: "联系配置入口",
    description: "微信、QQ、Telegram、邮箱等入口全部预留为可配置项，便于人工成交与快速迭代。",
    accent: "rust"
  }
];

const fallbackSteps: HomeStep[] = [
  {
    title: "浏览内容",
    description: "用户从首页快速理解品牌、商品结构和当前主推信息。"
  },
  {
    title: "确认意向",
    description: "通过商品卡片、说明区与联系按钮完成首次沟通。"
  },
  {
    title: "引导成交",
    description: "跳转到后台配置的联系方式，由人工继续跟进。"
  }
];

const fallbackChannels: HomeChannel[] = [
  { label: "微信", hint: "主联络入口" },
  { label: "Telegram", hint: "跨平台沟通" },
  { label: "邮箱", hint: "异步留资" }
];

const fallbackContent: HomePageContent = {
  brandName: "Showcase Studio",
  heroBadge: "精选商品、联系方式与首页文案都可持续更新",
  heroKicker: "Editorial Commerce Landing",
  heroLead: "让商品展示像一本",
  heroAccent: "经过排版的目录",
  heroDescription:
    "首页先建立品牌气质，再给出清晰的商品入口与联系路径。页面结构稳定，适合持续更新商品文案、后台配置和 SEO 信息。",
  primaryCtaLabel: "查看精选内容",
  secondaryCtaLabel: "了解承接流程",
  navLinks: fallbackNavLinks,
  metrics: fallbackMetrics,
  features: fallbackFeatures,
  workflowTitle: "从浏览到联系，路径足够短，但结构不能弱",
  workflowDescription: "先把用户最常见的动作变成最短路径，再把信息密度放在右侧内容区。",
  steps: fallbackSteps,
  channels: fallbackChannels,
  contactTitle: "联系入口由后台统一配置，前台负责清晰呈现",
  contactDescription: "联系区会直接承接后台维护的联系方式，方便快速咨询与人工成交。",
  contactActions: [
    { label: "微信咨询", href: "#" },
    { label: "Telegram", href: "#" },
    { label: "邮件联系", href: "#" }
  ]
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
  return fallbackNavLinks;
}

function buildMetrics(section: HomeSection | undefined) {
  const parsed = parseJsonRecord(section?.extraJson);
  const metrics = Array.isArray(parsed?.metrics) ? parsed.metrics : null;

  if (!metrics || metrics.length === 0) {
    return fallbackMetrics;
  }

  return metrics.slice(0, 3).map((item, index) => {
    const candidate = item as Record<string, unknown>;
    return {
      value: toText(candidate.value) || fallbackMetrics[index % fallbackMetrics.length].value,
      label: toText(candidate.label) || fallbackMetrics[index % fallbackMetrics.length].label,
      detail: toText(candidate.detail) || fallbackMetrics[index % fallbackMetrics.length].detail
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
    return fallbackFeatures;
  }

  return featureSections.slice(0, 3).map((section, index) => ({
    title: section.title?.trim() || fallbackFeatures[index % fallbackFeatures.length].title,
    description: section.content?.trim() || fallbackFeatures[index % fallbackFeatures.length].description,
    accent: fallbackAccentOrder[index % fallbackAccentOrder.length]
  }));
}

function buildSteps(section: HomeSection | undefined) {
  const parsed = parseJsonRecord(section?.extraJson);
  const steps = Array.isArray(parsed?.steps) ? parsed.steps : null;

  if (!steps || steps.length === 0) {
    return fallbackSteps;
  }

  return steps.slice(0, 3).map((item, index) => {
    const candidate = item as Record<string, unknown>;
    return {
      title: toText(candidate.title) || fallbackSteps[index % fallbackSteps.length].title,
      description: toText(candidate.description) || fallbackSteps[index % fallbackSteps.length].description
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
    return fallbackChannels;
  }

  return contacts.slice(0, 3).map((contact) => ({
    label: contact.name?.trim() || contactTypeLabel(contact.type),
    hint: contact.value?.trim() || contact.displayPlaces?.trim() || "主联络入口"
  }));
}

function buildContactActions(contacts: HomeContact[]) {
  if (contacts.length === 0) {
    return fallbackContent.contactActions;
  }

  return contacts.slice(0, 3).map((contact) => ({
    label: contact.name?.trim() || contactTypeLabel(contact.type),
    href: buildContactHref(contact)
  }));
}

function resolveHomeContent(config: HomeConfigData | null, contacts: HomeContact[]) {
  if (!config) {
    return fallbackContent;
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

  const brandName = getSettingValue(siteSettings, ["site_name", "site_title", "brand_name", "app_name"]) || fallbackContent.brandName;
  const heroBadge =
    getSettingValue(siteSettings, ["home_hero_badge", "hero_badge", "home_badge"]) ||
    heroSection?.sectionKey ||
    fallbackContent.heroBadge;
  const heroKicker = getSettingValue(siteSettings, ["home_hero_kicker", "hero_kicker", "site_kicker"]) || fallbackContent.heroKicker;
  const heroLead =
    getSettingValue(siteSettings, ["home_hero_lead", "hero_lead", "home_lead"]) ||
    fallbackContent.heroLead;
  const heroAccent =
    heroSection?.title?.trim() ||
    getSettingValue(siteSettings, ["home_hero_accent", "hero_accent", "home_title"]) ||
    fallbackContent.heroAccent;
  const heroDescription =
    heroSection?.content?.trim() ||
    getSettingValue(siteSettings, ["home_hero_description", "hero_description", "site_description"]) ||
    fallbackContent.heroDescription;
  const primaryCtaLabel =
    getSettingValue(siteSettings, ["home_primary_cta", "primary_cta", "hero_primary_cta"]) || fallbackContent.primaryCtaLabel;
  const secondaryCtaLabel =
    getSettingValue(siteSettings, ["home_secondary_cta", "secondary_cta", "hero_secondary_cta"]) ||
    fallbackContent.secondaryCtaLabel;
  const workflowTitle = workflowSection?.title?.trim() || fallbackContent.workflowTitle;
  const workflowDescription =
    workflowSection?.content?.trim() || fallbackContent.workflowDescription;
  const contactTitle = contactSection?.title?.trim() || fallbackContent.contactTitle;
  const contactDescription = contactSection?.content?.trim() || fallbackContent.contactDescription;

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

async function readPublicResponse<T>(path: string) {
  const response = await apiFetch<ApiResponse<T>>(path);
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
