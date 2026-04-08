import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-base font-semibold tracking-tight">
            PhotoBlog
          </Link>
          <nav className="hidden items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 sm:flex">
            {user ? (
              <>
                <Link className="rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800" href="/upload">
                  上传
                </Link>
              </>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden text-sm text-zinc-600 dark:text-zinc-300 sm:inline">
                {user.username}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                href="/login"
              >
                登录
              </Link>
              <Link
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
                href="/register"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

