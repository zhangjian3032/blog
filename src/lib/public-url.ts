import "server-only";

/**
 * 在反代场景下，req.url 可能是 0.0.0.0/localhost 等内部地址。
 * 这里优先使用 X-Forwarded-* / Host 还原对外可访问的 baseUrl。
 */
export function getPublicBaseUrl(req: Request) {
  const u = new URL(req.url);
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    u.host;

  const proto =
    req.headers.get("x-forwarded-proto") ??
    u.protocol.replace(":", "") ??
    "http";

  return `${proto}://${host}`;
}

export function publicUrl(req: Request, pathname: string) {
  return new URL(pathname, getPublicBaseUrl(req));
}

