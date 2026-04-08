import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const viewer = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      visibility: true,
      publishedAt: true,
      createdAt: true,
      user: { select: { id: true, username: true } },
      photos: { orderBy: [{ sortOrder: "asc" }], select: { id: true, thumbLg: true, width: true, height: true, aiDescription: true } },
    },
  });
  if (!post) return notFound();

  const isOwner = viewer?.id === post.user.id;
  if (!isOwner) {
    if (!post.publishedAt) return notFound();
    if (post.visibility !== "public") return notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="text-xs text-zinc-500">
          {post.user.username} · {(post.publishedAt ?? post.createdAt).toISOString().slice(0, 10)}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{post.title || "未命名"}</h1>
      </div>

      <div className="space-y-3">
        {post.photos.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={p.thumbLg}
              alt={p.aiDescription ?? ""}
              width={p.width}
              height={p.height}
              className="h-auto w-full"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ))}
      </div>

      {post.content ? (
        <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">{post.content}</div>
      ) : null}
    </div>
  );
}

