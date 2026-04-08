export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";

const formSchema = z.object({
  emailOrUsername: z.string().min(2),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const form = await req.formData();
  const parsed = formSchema.safeParse({
    emailOrUsername: form.get("emailOrUsername")?.toString() ?? "",
    password: form.get("password")?.toString() ?? "",
  });

  const redirectUrl = new URL("/login", req.url);
  if (!parsed.success) {
    redirectUrl.searchParams.set("error", "参数不合法");
    return NextResponse.redirect(redirectUrl, 303);
  }

  const { emailOrUsername, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    redirectUrl.searchParams.set("error", "账号或密码错误");
    return NextResponse.redirect(redirectUrl, 303);
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    redirectUrl.searchParams.set("error", "账号或密码错误");
    return NextResponse.redirect(redirectUrl, 303);
  }

  await setSessionCookie(user.id);
  return NextResponse.redirect(new URL("/", req.url), 303);
}

