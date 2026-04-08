export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const env = getEnv();
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? req.headers.get("x-bootstrap-token") ?? "";

  if (!env.BOOTSTRAP_TOKEN || token !== env.BOOTSTRAP_TOKEN) {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  const email = env.BOOTSTRAP_EMAIL;
  const username = env.BOOTSTRAP_USERNAME;
  const password = env.BOOTSTRAP_PASSWORD;
  if (!email || !username || !password) {
    return NextResponse.json({
      error: "缺少 BOOTSTRAP_EMAIL / BOOTSTRAP_USERNAME / BOOTSTRAP_PASSWORD",
    }, { status: 400 });
  }

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true, email: true, username: true },
  });
  if (exists) {
    return NextResponse.json({ ok: true, created: false, user: exists });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true },
  });

  return NextResponse.json({ ok: true, created: true, user });
}

