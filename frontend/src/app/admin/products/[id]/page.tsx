import { AdminProductEditor } from "@/components/admin/product-editor";

type AdminProductEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const { id } = await params;
  return <AdminProductEditor mode="edit" productId={id} />;
}
