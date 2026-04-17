import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "用户注册 | 商品展示网站",
  description: "创建用户账户，后续可用于收藏、订阅和更多前台能力。"
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(143,67,24,0.14),transparent_26%),linear-gradient(180deg,#fff8ef_0%,#f3e7d7_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_30px_80px_rgba(16,16,16,0.12)] lg:grid-cols-[0.98fr_1.02fr]">
        <div className="bg-[rgba(255,250,244,0.96)] px-6 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto flex h-full max-w-xl flex-col justify-center">
            <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_50px_rgba(16,16,16,0.06)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Access</p>
                  <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">创建账户</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">保留注册界面，为后续用户体系、收藏清单、优惠活动和消息订阅预留入口。</p>
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
                  用户名
                  <input
                    type="text"
                    placeholder="请输入用户名"
                    className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
                    手机号
                    <input
                      type="text"
                      placeholder="请输入手机号"
                      className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
                    邮箱
                    <input
                      type="email"
                      placeholder="请输入邮箱"
                      className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
                    密码
                    <input
                      type="password"
                      placeholder="请输入密码"
                      className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
                    确认密码
                    <input
                      type="password"
                      placeholder="请再次输入密码"
                      className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    />
                  </label>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[#fffaf4] px-4 py-3 text-sm text-[var(--muted)]">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[var(--line)]" />
                  <span>我已阅读并同意平台使用说明与隐私规则，后续可在后台统一接入真实协议内容。</span>
                </label>

                <button
                  type="button"
                  className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f4318]"
                >
                  创建账户
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
                <span>已有账户？</span>
                <Link href="/login" className="font-medium text-[var(--accent)] transition hover:opacity-80">
                  去登录
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[linear-gradient(145deg,#201711,#442815_40%,#a94f1d)] px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,226,197,0.18),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-[rgba(255,223,196,0.84)]">User / Register</p>
              <h1 className="max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">让前台只保留必要入口，但不给后续扩展设限。</h1>
              <p className="max-w-xl text-sm leading-7 text-white/76 sm:text-base">
                当前站点前台只保留商品界面、登录、注册三类页面。这样访问路径足够短，后续如果要接用户体系，也不需要重新规划入口。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/58">前台范围</p>
                <p className="mt-2 text-lg font-semibold">已收口</p>
                <p className="mt-2 text-sm leading-6 text-white/72">展示页之外，不再保留多余公开内容页。</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/58">账户入口</p>
                <p className="mt-2 text-lg font-semibold">双页保留</p>
                <p className="mt-2 text-sm leading-6 text-white/72">登录页和注册页继续保留，便于后续接用户功能。</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/58">后续能力</p>
                <p className="mt-2 text-lg font-semibold">可扩展</p>
                <p className="mt-2 text-sm leading-6 text-white/72">会员价、收藏、消息通知都可以从这里延展。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
