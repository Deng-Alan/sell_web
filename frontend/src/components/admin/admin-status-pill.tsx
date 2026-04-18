type AdminStatusPillProps = {
  status: string;
  label?: string;
};

const statusClasses: Record<string, string> = {
  enabled: "border-emerald-200 bg-emerald-50 text-emerald-700",
  disabled: "border-slate-200 bg-slate-100 text-slate-600",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  published: "border-blue-200 bg-blue-50 text-blue-700",
  archived: "border-rose-200 bg-rose-50 text-rose-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  indexed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  noindex: "border-rose-200 bg-rose-50 text-rose-700"
};

export function AdminStatusPill({ status, label }: AdminStatusPillProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]",
        statusClasses[status] ?? "border-slate-200 bg-slate-100 text-slate-600"
      ].join(" ")}
    >
      {label ?? status}
    </span>
  );
}
