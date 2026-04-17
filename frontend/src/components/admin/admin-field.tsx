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
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {required ? <span className="text-xs text-cyan-300">必填</span> : null}
      </div>
      {children}
      {hint ? <span className="text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}
