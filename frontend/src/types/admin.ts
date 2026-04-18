export type ChannelStatus = "enabled" | "disabled" | "pending";

export type ChannelType = "wechat" | "qq" | "phone" | "telegram" | "email" | "website" | "qr" | "link" | "other";

export type ContactChannelListItem = {
  id: string;
  name: string;
  type: ChannelType;
  value: string;
  status: ChannelStatus;
  priority: number;
  usageCount: number;
  updatedAt: string;
};

export type HomeSectionStatus = "enabled" | "disabled" | "draft";

export type HomeSectionType = "hero" | "banner" | "feature" | "notice" | "quick-link";

export type HomeSectionListItem = {
  id: string;
  title: string;
  type: HomeSectionType;
  summary: string;
  status: HomeSectionStatus;
  sortOrder: number;
  updatedAt: string;
};

export type SeoRuleStatus = "indexed" | "noindex" | "draft";

export type SeoRuleListItem = {
  id: string;
  pageName: string;
  route: string;
  titleTemplate: string;
  descriptionTemplate: string;
  robots: string;
  status: SeoRuleStatus;
  updatedAt: string;
};
