type AdminStatusPillProps = {
  status: string;
  label?: string;
};

const statusClasses: Record<string, string> = {
  enabled: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  disabled: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  draft: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  published: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  archived: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  indexed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  noindex: "border-rose-400/30 bg-rose-400/10 text-rose-200"
};

export function AdminStatusPill({ status, label }: AdminStatusPillProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
        statusClasses[status] ?? "border-white/10 bg-white/5 text-slate-200"
      ].join(" ")}
    >
      {label ?? status}
    </span>
  );
}
