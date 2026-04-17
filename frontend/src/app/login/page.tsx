import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "用户登录 | 商品展示网站",
  description: "登录后可继续查看账户信息、收藏入口或后续会员能力。"
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(169,79,29,0.12),transparent_28%),linear-gradient(180deg,#fff8ef_0%,#f6ede0_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_30px_80px_rgba(16,16,16,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden bg-[linear-gradient(145deg,#1d1511,#2d2119_45%,#8f4318)] px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,210,168,0.18),transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-[rgba(255,223,196,0.84)]">User / Login</p>
              <h1 className="max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">登录后继续管理你的访问入口。</h1>
              <p className="max-w-xl text-sm leading-7 text-white/76 sm:text-base">
                前台只保留一个商品展示界面，账户入口集中到这里。后续如果接入收藏、订单、会员价或消息通知，可以直接从这套界面继续扩展。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/58">界面策略</p>
                <p className="mt-2 text-lg font-semibold">单一前台</p>
                <p className="mt-2 text-sm leading-6 text-white/72">展示、登录、注册三类入口统一管理。</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/58">登录态</p>
                <p className="mt-2 text-lg font-semibold">可扩展</p>
                <p className="mt-2 text-sm leading-6 text-white/72">当前保留表单位，后续可接用户鉴权。</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/58">跳转路径</p>
                <p className="mt-2 text-lg font-semibold">清晰收口</p>
                <p className="mt-2 text-sm leading-6 text-white/72">登录后可回首页或进入后续用户中心。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(255,250,244,0.96)] px-6 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto flex h-full max-w-xl flex-col justify-center">
            <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_50px_rgba(16,16,16,0.06)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Access</p>
                  <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">用户登录</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">当前先保留完整登录界面，后续可接短信、邮箱验证码或账号密码登录。</p>
                </div>
                <Link
                  href="/"
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  返回首页
                </Link>
              </div>

              <form className="mt-8 space-y-5">
                <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
                  手机号 / 邮箱
                  <input
                    type="text"
                    placeholder="请输入手机号或邮箱"
                    className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
                  密码
                  <input
                    type="password"
                    placeholder="请输入登录密码"
                    className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                  />
                </label>

                <div className="flex items-center justify-between gap-4 text-sm text-[var(--muted)]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-[var(--line)]" />
                    <span>记住我</span>
                  </label>
                  <a href="#" className="transition hover:text-[var(--accent)]">
                    忘记密码
                  </a>
                </div>

                <button
                  type="button"
                  className="w-full rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e241d]"
                >
                  登录
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
                <span>还没有账户？</span>
                <Link href="/register" className="font-medium text-[var(--accent)] transition hover:opacity-80">
                  去注册
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
