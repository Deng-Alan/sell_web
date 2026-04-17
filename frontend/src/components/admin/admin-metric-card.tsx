type AdminMetricCardProps = {
  label: string;
  value: string;
  hint: string;
  accent?: "cyan" | "emerald" | "amber" | "violet";
};

const accentStyles: Record<NonNullable<AdminMetricCardProps["accent"]>, string> = {
  cyan: "from-cyan-400/20 to-cyan-400/0 text-cyan-100",
  emerald: "from-emerald-400/20 to-emerald-400/0 text-emerald-100",
  amber: "from-amber-400/20 to-amber-400/0 text-amber-100",
  violet: "from-violet-400/20 to-violet-400/0 text-violet-100"
};

export function AdminMetricCard({ label, value, hint, accent = "cyan" }: AdminMetricCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20">
      <div className={`mb-4 h-12 rounded-2xl bg-gradient-to-br ${accentStyles[accent]}`} />
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
    </article>
  );
}
