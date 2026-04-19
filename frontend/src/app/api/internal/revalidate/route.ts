import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { normalizeCacheKeys } from "@/lib/public-cache";

type RevalidatePayload = {
  tags?: string[];
  paths?: string[];
};

export const dynamic = "force-dynamic";

function readSecret() {
  return process.env.REVALIDATE_SECRET?.trim() ?? "";
}

function normalizePaths(values?: string[]) {
  return normalizeCacheKeys(values ?? []).map((value) => (value.startsWith("/") ? value : `/${value}`));
}

export async function POST(request: NextRequest) {
  const secret = readSecret();
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "REVALIDATE_SECRET 未配置" },
      { status: 503 }
    );
  }

  const providedSecret = request.headers.get("x-revalidate-secret")?.trim() ?? "";
  if (providedSecret !== secret) {
    return NextResponse.json(
      { success: false, message: "无效的刷新密钥" },
      { status: 401 }
    );
  }

  const payload = (await request.json().catch(() => null)) as RevalidatePayload | null;
  const tags = normalizeCacheKeys(payload?.tags ?? []);
  const paths = normalizePaths(payload?.paths);

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json(
      { success: false, message: "至少需要一个 tags 或 paths" },
      { status: 400 }
    );
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    success: true,
    message: "刷新请求已执行",
    data: {
      tags,
      paths
    }
  });
}
