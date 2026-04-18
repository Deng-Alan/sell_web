import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
  className?: string;
};

export function AdminShell({ children, className = "" }: AdminShellProps) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6 lg:p-7",
        className
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-50 via-white to-emerald-50" />
      <div className="relative">{children}</div>
    </section>
  );
}
