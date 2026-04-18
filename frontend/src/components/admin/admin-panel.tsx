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
    <section className={["admin-panel-card p-5 sm:p-6", className].join(" ")}>
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="admin-section-title">{title}</h2>
          {description ? <p className="text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
