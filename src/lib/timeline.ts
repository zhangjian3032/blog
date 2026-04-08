import "server-only";

import { prisma } from "@/lib/prisma";

export async function getTimeline(params: {
  viewerUserId: string | null;
  page: number;
  pageSize: number;
}) {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(50, Math.max(1, params.pageSize));
  const skip = (page - 1) * pageSize;

  const where = params.viewerUserId
    ? { userId: params.viewerUserId }
    : { publishedAt: { not: null }, visibility: "public" as const };

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    skip,
    take: pageSize,
    select: {
      id: true,
      title: true,
      content: true,
      publishedAt: true,
      createdAt: true,
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

  return posts;
}

