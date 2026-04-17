import type { ReactNode } from "react";

type AdminPanelProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminPanel({ title, description, actions, children, className = "" }: AdminPanelProps) {
  return (
    <section
      className={[
        "rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-6",
        className
      ].join(" ")}
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
