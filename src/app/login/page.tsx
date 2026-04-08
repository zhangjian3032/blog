"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-xl font-semibold">登录</h1>
      <div className="space-y-3">
        <input
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          placeholder="邮箱或用户名"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={busy}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
          onClick={async () => {
            setBusy(true);
            try {
              const resp = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailOrUsername, password }),
              });
              const data = await resp.json();
              if (!resp.ok) throw new Error(data?.error ?? "登录失败");
              router.push("/");
              router.refresh();
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : "登录失败";
              alert(msg);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "登录中…" : "登录"}
        </button>
      </div>

      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        还没有账号？<Link className="underline" href="/register">去注册</Link>
      </div>
    </div>
  );
}
