import type { HTMLAttributes, ReactNode } from "react";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
};

export function SurfaceCard({
  title,
  eyebrow,
  description,
  children,
  tone = "light",
  className = "",
  ...rest
}: SurfaceCardProps) {
  const isDark = tone === "dark";

  return (
    <section
      className={`rounded-[1.75rem] border p-6 shadow-[var(--shadow)] backdrop-blur-xl ${
        isDark
          ? "border-[rgba(255,255,255,0.08)] bg-[rgba(24,19,16,0.95)] text-[var(--surface-strong)]"
          : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
      } ${className}`.trim()}
      {...rest}
    >
      {(eyebrow || title || description) && (
        <div className="mb-5 flex flex-col gap-2">
          {eyebrow ? (
            <p
              className={`text-[0.65rem] font-semibold uppercase tracking-[0.35em] ${
                isDark ? "text-[rgba(255,250,244,0.64)]" : "text-[var(--muted)]"
              }`}
            >
              {eyebrow}
            </p>
          ) : null}
          {title ? <h3 className="font-display text-2xl">{title}</h3> : null}
          {description ? (
            <p className={`max-w-xl text-sm leading-6 ${isDark ? "text-[rgba(255,250,244,0.74)]" : "text-[var(--muted)]"}`}>
              {description}
            </p>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}
