import "server-only";

import { prisma } from "@/lib/prisma";
import { getViewerUserId } from "@/lib/auth";

export async function getCurrentUser() {
  const userId = await getViewerUserId();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, avatarUrl: true, theme: true },
  });
}

