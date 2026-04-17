type MetricTileProps = {
  value: string;
  label: string;
  detail?: string;
};

export function MetricTile({ value, label, detail }: MetricTileProps) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_20px_45px_rgba(48,32,16,0.08)]">
      <p className="font-display text-3xl text-[var(--ink)]">{value}</p>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      {detail ? <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{detail}</p> : null}
    </div>
  );
}
