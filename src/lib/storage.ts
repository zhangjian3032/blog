import "server-only";

import { Client } from "minio";
import { getEnv } from "@/lib/env";

let client: Client | null = null;

function getClient() {
  if (client) return client;
  const env = getEnv();
  client = new Client({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  });
  return client;
}

export async function putObject(params: {
  objectName: string;
  data: Buffer;
  contentType: string;
}) {
  const env = getEnv();
  const c = getClient();
  await c.putObject(
    env.MINIO_BUCKET,
    params.objectName,
    params.data,
    params.data.length,
    { "Content-Type": params.contentType }
  );
  return `${env.MINIO_PUBLIC_URL.replace(/\/$/, "")}/${env.MINIO_BUCKET}/${params.objectName}`;
}
