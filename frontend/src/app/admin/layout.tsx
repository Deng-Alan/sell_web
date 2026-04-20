import { AdminFrame } from "@/components/admin/admin-frame";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminFrame>{children}</AdminFrame>;
}
