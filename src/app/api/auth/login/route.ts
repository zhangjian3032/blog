export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";

const bodySchema = z.object({
  emailOrUsername: z.string().min(2),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数不合法" }, { status: 400 });
  }

  const { emailOrUsername, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
    select: { id: true, passwordHash: true, username: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email } });
}

