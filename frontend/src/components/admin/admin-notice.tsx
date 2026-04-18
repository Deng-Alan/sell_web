type AdminNoticeTone = "info" | "success" | "warning" | "error";

const toneClasses: Record<AdminNoticeTone, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-rose-200 bg-rose-50 text-rose-700"
};

export function AdminNotice({ tone, message }: { tone: AdminNoticeTone; message: string }) {
  return <div className={["rounded-2xl border px-4 py-3 text-sm", toneClasses[tone]].join(" ")}>{message}</div>;
}
