"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

type AdminFrameProps = {
  children: ReactNode;
};

export function AdminFrame({ children }: AdminFrameProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
