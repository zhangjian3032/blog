export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getViewerUserId } from "@/lib/auth";
import { putObject } from "@/lib/storage";
import { getImageSize, toWebpThumb } from "@/lib/image";
import exifr from "exifr";
import { Prisma } from "@prisma/client";

const MAX_FILES = 50;
const MAX_SIZE_BYTES = 30 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/heic") return "heic";
  if (type === "image/heif") return "heif";
  return "jpg";
}

export async function POST(req: Request) {
  const userId = await getViewerUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const form = await req.formData();
  const postIdFromClient = form.get("postId")?.toString();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "未选择文件" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ error: `单次最多上传 ${MAX_FILES} 张` }, { status: 400 });

  let postId = postIdFromClient;
  if (postId) {
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (!post) return NextResponse.json({ error: "postId 不存在" }, { status: 404 });
    if (post.userId !== userId) return NextResponse.json({ error: "无权限" }, { status: 403 });
  } else {
    const created = await prisma.post.create({
      data: { userId },
      select: { id: true },
    });
    postId = created.id;
  }

  const createdPhotos: Array<{ id: string; thumbMd: string; originalUrl: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: `单张照片最大 30MB: ${file.name}` }, { status: 400 });
    }
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `不支持的格式: ${file.type}` }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const exifRaw: unknown = await exifr.parse(buf, { gps: true, tiff: true }).catch(() => null);
    const exifObj = (exifRaw && typeof exifRaw === "object") ? (exifRaw as Record<string, unknown>) : null;
    const takenAtRaw = exifObj?.DateTimeOriginal ?? exifObj?.CreateDate;
    const takenAt = takenAtRaw ? new Date(String(takenAtRaw)) : null;
    const exifJson = exifRaw ? (JSON.parse(JSON.stringify(exifRaw)) as Prisma.InputJsonValue) : undefined;

    const imgSize = await getImageSize(buf);
    if (!imgSize.width || !imgSize.height) {
      return NextResponse.json({ error: `无法识别图片: ${file.name}` }, { status: 400 });
    }

    const baseKey = `${userId}/${postId}/${crypto.randomUUID()}`;
    const originalKey = `${baseKey}.${extFromType(file.type || "image/jpeg")}`;
    const smKey = `${baseKey}.sm.webp`;
    const mdKey = `${baseKey}.md.webp`;
    const lgKey = `${baseKey}.lg.webp`;

    const [thumbSmBuf, thumbMdBuf, thumbLgBuf] = await Promise.all([
      toWebpThumb(buf, 400),
      toWebpThumb(buf, 900),
      toWebpThumb(buf, 1600),
    ]);

    const [originalUrl, thumbSm, thumbMd, thumbLg] = await Promise.all([
      putObject({ objectName: originalKey, data: buf, contentType: file.type || "image/jpeg" }),
      putObject({ objectName: smKey, data: thumbSmBuf, contentType: "image/webp" }),
      putObject({ objectName: mdKey, data: thumbMdBuf, contentType: "image/webp" }),
      putObject({ objectName: lgKey, data: thumbLgBuf, contentType: "image/webp" }),
    ]);

    const photo = await prisma.photo.create({
      data: {
        postId: postId!,
        originalUrl,
        thumbSm,
        thumbMd,
        thumbLg,
        width: imgSize.width,
        height: imgSize.height,
        exifData: exifJson,
        takenAt: takenAt ?? undefined,
        sortOrder: i,
      },
      select: { id: true, thumbMd: true, originalUrl: true },
    });

    createdPhotos.push(photo);
  }

  return NextResponse.json({ postId, photos: createdPhotos });
}
