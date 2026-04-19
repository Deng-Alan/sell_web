import { AdminProductEditor } from "@/components/admin/product-editor";

type AdminProductCreatePageProps = {
  searchParams: Promise<{
    copyFrom?: string | string[];
  }>;
};

function resolveCopyFrom(value: string | string[] | undefined) {
  const resolved = Array.isArray(value) ? value[0] : value;
  const trimmed = resolved?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

export default async function AdminProductCreatePage({ searchParams }: AdminProductCreatePageProps) {
  const params = await searchParams;
  const copyFromProductId = resolveCopyFrom(params.copyFrom);

  return <AdminProductEditor mode="create" copyFromProductId={copyFromProductId} />;
}
