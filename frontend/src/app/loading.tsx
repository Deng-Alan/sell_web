export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--line)] border-t-[var(--accent)]"></div>
      <p className="text-sm tracking-widest text-[var(--muted)] uppercase">Loading...</p>
    </div>
  );
}
