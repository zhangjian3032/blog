import "server-only";

import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  AUTH_SECRET: z.string().min(16),

  MINIO_ENDPOINT: z.string().min(1).default("localhost"),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_ACCESS_KEY: z.string().min(1).default("minio"),
  MINIO_SECRET_KEY: z.string().min(1).default("minio123"),
  MINIO_BUCKET: z.string().min(1).default("photoblog"),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_PUBLIC_URL: z.string().url().default("http://localhost:9000"),

  AI_PROVIDER: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),

  // 可选：内置账号（用于一键初始化）
  BOOTSTRAP_TOKEN: z.string().optional(),
  BOOTSTRAP_EMAIL: z.string().email().optional(),
  BOOTSTRAP_USERNAME: z.string().min(2).max(50).optional(),
  BOOTSTRAP_PASSWORD: z.string().min(8).max(100).optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;

  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`环境变量校验失败: ${msg}`);
  }
  cached = parsed.data;
  return cached;
}
