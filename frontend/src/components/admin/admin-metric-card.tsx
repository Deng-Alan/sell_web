type AdminMetricCardProps = {
  label: string;
  value: string;
  hint: string;
  accent?: "cyan" | "emerald" | "amber" | "violet";
};

const accentStyles: Record<NonNullable<AdminMetricCardProps["accent"]>, string> = {
  cyan: "from-blue-500/20 to-blue-100 text-blue-700",
  emerald: "from-emerald-500/20 to-emerald-100 text-emerald-700",
  amber: "from-amber-500/20 to-amber-100 text-amber-700",
  violet: "from-violet-500/20 to-violet-100 text-violet-700"
};

export function AdminMetricCard({ label, value, hint, accent = "cyan" }: AdminMetricCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className={`mb-4 h-12 rounded-2xl bg-gradient-to-br ${accentStyles[accent]}`} />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{hint}</p>
    </article>
  );
}
