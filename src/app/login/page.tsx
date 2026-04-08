import Link from "next/link";

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await props.searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-xl font-semibold">登录</h1>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <form className="space-y-3" action="/api/auth/login-form" method="post">
        <input
          name="emailOrUsername"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          placeholder="邮箱或用户名"
          autoComplete="username"
          required
        />
        <input
          name="password"
          type="password"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          placeholder="密码"
          autoComplete="current-password"
          required
        />
        <button type="submit" className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-black">
          登录
        </button>
      </form>

      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        还没有账号？<Link className="underline" href="/register">去注册</Link>
      </div>
    </div>
  );
}
