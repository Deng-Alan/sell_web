type SectionHeadingProps = {
  kicker: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({ kicker, title, description, align = "left" }: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignmentClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[var(--muted)]">{kicker}</p>
      <h2 className="max-w-2xl font-display text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">{description}</p>
    </div>
  );
}
