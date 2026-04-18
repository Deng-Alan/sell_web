"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { clearStoredAdminAuth, getStoredAdminAuth, loginAdmin } from "@/lib/auth";
import type { AdminAuthSession } from "@/types/auth";

type LoginFormState = {
  username: string;
  password: string;
  rememberMe: boolean;
};

const initialFormState: LoginFormState = {
  username: "",
  password: "",
  rememberMe: true
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedAuth, setStoredAuth] = useState<AdminAuthSession | null>(null);

  useEffect(() => {
    setStoredAuth(getStoredAdminAuth());
  }, []);

  useEffect(() => {
    if (storedAuth) {
      setForm((current) => ({
        ...current,
        username: storedAuth.username,
        rememberMe: storedAuth.rememberMe
      }));
      setSuccessMessage(`已载入 ${storedAuth.nickname || storedAuth.username} 的保存登录态。`);
    }
  }, [storedAuth]);

  function updateField<Key extends keyof LoginFormState>(key: Key, value: LoginFormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username || !password) {
      setErrorMessage("请输入管理员账号和密码。");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await loginAdmin({ username, password }, form.rememberMe);
      setStoredAuth(session);
      setSuccessMessage(`登录成功，欢迎 ${session.nickname || session.username}。`);
      router.replace("/admin");
    } catch (error) {
      const message = error instanceof Error ? error.message : "登录失败，请稍后重试。";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClearAuth() {
    clearStoredAdminAuth();
    setStoredAuth(null);
    setForm(initialFormState);
    setSuccessMessage("已清除本地保存的登录态。");
  }

  return (
    <main className="admin-app min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center justify-center">
        <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-8">
          <div className="space-y-3 text-center">
            <p className="admin-kicker">Admin Login</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">后台登录</h1>
            <p className="text-sm leading-6 text-slate-500">请输入管理员账号与密码进入后台管理系统。</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              账号
              <input
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={(event) => updateField("username", event.target.value)}
                placeholder="admin"
                className="admin-input"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              密码
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="请输入密码"
                className="admin-input"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => updateField("rememberMe", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <span>保持登录</span>
            </label>

            {(errorMessage || successMessage) && (
              <div
                className={[
                  "rounded-2xl border px-4 py-3 text-sm",
                  errorMessage
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                ].join(" ")}
                aria-live="polite"
              >
                {errorMessage || successMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="admin-button-primary w-full py-3"
              >
                {isSubmitting ? "登录中..." : "进入后台"}
              </button>
              {storedAuth ? (
                <button type="button" onClick={handleClearAuth} className="admin-button-secondary w-full py-3">
                  清除已保存登录态
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
