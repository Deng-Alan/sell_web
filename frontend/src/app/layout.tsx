import "./globals.css";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    template: "%s | 商品展示网站",
    default: "商品展示网站 - 您的专属线上商品目录"
  },
  description: "全方位浏览最新、最热的精选商品。这是为卖家提供的高效商品展示网站，方便买家查阅并建立联系。",
  openGraph: {
    title: "商品展示网站",
    description: "全方位浏览最新、最热的精选商品。",
    type: "website",
    locale: "zh_CN",
    siteName: "商品展示网站",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen text-[var(--ink)] bg-[rgba(255,249,241,0.9)]">{children}</body>
    </html>
  );
}
