export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getViewerUserId } from "@/lib/auth";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getViewerUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;

  const post = await prisma.post.findUnique({ where: { id }, select: { userId: true } });
  if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });
  if (post.userId !== userId) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const updated = await prisma.post.update({
    where: { id },
    data: { publishedAt: new Date() },
    select: { id: true, publishedAt: true },
  });
  return NextResponse.json({ post: updated });
}

