import type { ReactNode } from "react";

type AdminFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
};

export function AdminField({ label, hint, children, className = "", required = false }: AdminFieldProps) {
  return (
    <label className={["flex flex-col gap-2", className].join(" ")}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {required ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">必填</span> : null}
      </div>
      {children}
      {hint ? <span className="text-xs leading-5 text-slate-400">{hint}</span> : null}
    </label>
  );
}
