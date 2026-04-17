import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
  className?: string;
};

export function AdminShell({ children, className = "" }: AdminShellProps) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/30 ring-1 ring-white/5 sm:p-6",
        className
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="relative">{children}</div>
    </section>
  );
}
