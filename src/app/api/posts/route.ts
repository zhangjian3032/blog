export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getViewerUserId } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
});

export async function GET() {
  const userId = await getViewerUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }],
    select: { id: true, title: true, createdAt: true, publishedAt: true },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const userId = await getViewerUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数不合法" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId,
      title: parsed.data.title ?? "",
      content: parsed.data.content ?? "",
    },
    select: { id: true },
  });
  return NextResponse.json({ post });
}

