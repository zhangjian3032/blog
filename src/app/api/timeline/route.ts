export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getViewerUserId } from "@/lib/auth";
import { getTimeline } from "@/lib/timeline";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "参数不合法" }, { status: 400 });
  }
  const viewerUserId = await getViewerUserId();
  const posts = await getTimeline({ viewerUserId, ...parsed.data });
  return NextResponse.json({ posts });
}

