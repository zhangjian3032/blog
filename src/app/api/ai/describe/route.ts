export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/env";

const bodySchema = z.object({
  imageUrl: z.string().url(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "参数不合法" }, { status: 400 });

  const env = getEnv();
  if (env.AI_PROVIDER !== "openai" || !env.OPENAI_API_KEY) {
    return NextResponse.json({
      title: "",
      description: "",
      tags: [],
      provider: "none",
    });
  }

  const model = env.OPENAI_MODEL || "gpt-4o-mini";
  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "请用中文为这张照片生成：1) 一句标题 2) 1-2 句描述 3) 3-6 个标签（用逗号分隔）。以 JSON 返回，字段：title, description, tags" },
            { type: "input_image", image_url: parsed.data.imageUrl },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) {
    return NextResponse.json({
      title: "",
      description: "",
      tags: [],
      provider: "openai",
      error: `OpenAI 请求失败: ${resp.status}`,
    });
  }

  const data: unknown = await resp.json();
  const text =
    typeof data === "object" && data
      ? (data as { output?: Array<{ content?: Array<{ text?: string }> }> }).output?.[0]?.content?.[0]?.text
      : undefined;

  const payload = (() => {
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  })();

  const outSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
  });
  const out = outSchema.safeParse(payload);
  const parsedJson = out.success ? out.data : null;

  return NextResponse.json({
    title: parsedJson?.title ?? "",
    description: parsedJson?.description ?? "",
    tags: Array.isArray(parsedJson?.tags)
      ? parsedJson.tags
      : typeof parsedJson?.tags === "string"
        ? parsedJson.tags
            .split(/[,，]/)
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    provider: "openai",
  });
}
