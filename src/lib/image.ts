import "server-only";

import sharp from "sharp";

export async function toWebpThumb(input: Buffer, width: number) {
  return sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

export async function getImageSize(input: Buffer) {
  const meta = await sharp(input).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

