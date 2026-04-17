export type HomeNavLink = {
  label: string;
  href: string;
};

export type HomeMetric = {
  value: string;
  label: string;
  detail: string;
};

export type HomeFeature = {
  title: string;
  description: string;
  accent: string;
};

export type HomeStep = {
  title: string;
  description: string;
};

export type HomeChannel = {
  label: string;
  hint: string;
};

export type HomeSiteSetting = {
  id?: number;
  settingKey: string;
  settingValue: string;
  groupName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HomeSection = {
  id?: number;
  sectionKey: string;
  title: string;
  content: string;
  imageUrl?: string;
  extraJson?: string;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type HomeConfigData = {
  siteSettings: HomeSiteSetting[];
  homeSections: HomeSection[];
};

export type HomeContact = {
  id?: number;
  type: string;
  name: string;
  value: string;
  qrImage?: string | null;
  jumpUrl?: string | null;
  displayPlaces?: string | null;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type HomePageContent = {
  brandName: string;
  heroBadge: string;
  heroKicker: string;
  heroLead: string;
  heroAccent: string;
  heroDescription: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  navLinks: HomeNavLink[];
  metrics: HomeMetric[];
  features: HomeFeature[];
  workflowTitle: string;
  workflowDescription: string;
  steps: HomeStep[];
  channels: HomeChannel[];
  contactTitle: string;
  contactDescription: string;
  contactActions: Array<{
    label: string;
    href: string;
  }>;
};
