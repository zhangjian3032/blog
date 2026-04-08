export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getViewerUserId } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  visibility: z.enum(["public", "friends", "private"]).optional(),
});

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const viewerUserId = await getViewerUserId();
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      visibility: true,
      createdAt: true,
      publishedAt: true,
      user: { select: { id: true, username: true, avatarUrl: true } },
      photos: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          originalUrl: true,
          thumbSm: true,
          thumbMd: true,
          thumbLg: true,
          width: true,
          height: true,
          aiDescription: true,
          takenAt: true,
        },
      },
    },
  });
  if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });

  const isOwner = viewerUserId && post.user.id === viewerUserId;
  if (!isOwner) {
    if (!post.publishedAt) return NextResponse.json({ error: "不可见" }, { status: 404 });
    if (post.visibility !== "public") return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  return NextResponse.json({ post });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getViewerUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数不合法" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id }, select: { userId: true } });
  if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });
  if (post.userId !== userId) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      visibility: parsed.data.visibility,
    },
    select: { id: true },
  });
  return NextResponse.json({ post: updated });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getViewerUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({ where: { id }, select: { userId: true } });
  if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });
  if (post.userId !== userId) return NextResponse.json({ error: "无权限" }, { status: 403 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
