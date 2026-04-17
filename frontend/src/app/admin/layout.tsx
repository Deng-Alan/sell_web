import { AdminFrame } from "@/components/admin/admin-frame";

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminFrame>{children}</AdminFrame>;
}
