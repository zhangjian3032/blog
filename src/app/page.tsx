import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { getTimeline } from "@/lib/timeline";
import { Timeline } from "@/components/timeline";

export default async function Home() {
  const user = await getCurrentUser();
  const posts = await getTimeline({ viewerUserId: user?.id ?? null, page: 1, pageSize: 20 });

  const serializable = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    photos: p.photos.map((ph) => ({
      ...ph,
      takenAt: ph.takenAt ? ph.takenAt.toISOString() : null,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-black dark:ring-zinc-800">
        <h1 className="text-xl font-semibold tracking-tight">时间轴瀑布流</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {user
            ? "展示你的所有记录（包含草稿）。点击“上传”开始创建新的照片记录。"
            : "展示公开内容。登录后可创建与管理你的照片博客。"}
        </p>
        {!user ? (
          <div className="mt-4 flex gap-2">
            <Link className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-black" href="/login">
              登录
            </Link>
            <Link className="rounded-md px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" href="/register">
              注册
            </Link>
          </div>
        ) : null}
      </div>

      {serializable.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          暂无内容。{user ? "去上传几张照片吧。" : "登录后开始创建。"}
        </div>
      ) : (
        <Timeline posts={serializable} />
      )}
    </div>
  );
}
