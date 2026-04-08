import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { PostEditor } from "@/components/post-editor";

export default async function PostEditPage(props: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await props.params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, userId: true, title: true, content: true, visibility: true, photos: { select: { id: true, thumbMd: true } } },
  });
  if (!post) return notFound();
  if (post.userId !== user.id) return notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">编辑博文</h1>
      <div className="text-sm text-zinc-600 dark:text-zinc-300">已上传 {post.photos.length} 张照片</div>
      <PostEditor
        postId={post.id}
        title={post.title}
        content={post.content}
        visibility={post.visibility as "public" | "friends" | "private"}
      />
    </div>
  );
}
