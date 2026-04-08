export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(50),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const form = await req.formData();
  const parsed = formSchema.safeParse({
    email: form.get("email")?.toString() ?? "",
    username: form.get("username")?.toString() ?? "",
    password: form.get("password")?.toString() ?? "",
  });

  const redirectUrl = new URL("/register", req.url);
  if (!parsed.success) {
    redirectUrl.searchParams.set("error", "参数不合法");
    return NextResponse.redirect(redirectUrl, 303);
  }

  const { email, username, password } = parsed.data;
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });
  if (exists) {
    redirectUrl.searchParams.set("error", "邮箱或用户名已存在");
    return NextResponse.redirect(redirectUrl, 303);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true },
  });
  await setSessionCookie(user.id);

  return NextResponse.redirect(new URL("/", req.url), 303);
}

