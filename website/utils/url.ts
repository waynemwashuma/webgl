function normalizeBase(value: string): string {
  let normalized = value.trim();
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (!normalized.endsWith("/")) normalized = `${normalized}/`;
  return normalized;
}

const base = normalizeBase(process.env.BASE || "/");

export function withBase(path: string): string {
  let resolvedPath = path;
  if (path.startsWith("//")) {
    const url = new URL(`https:${path}`);
    resolvedPath = `${url.pathname}${url.search}${url.hash}`;
  } else if (/^[a-z]+:/i.test(path)) {
    const url = new URL(path);
    resolvedPath = `${url.pathname}${url.search}${url.hash}` || "/";
  }

  const [withoutHash, hash = ""] = resolvedPath.split("#", 2);
  const [withoutQuery, query = ""] = withoutHash.split("?", 2);
  const cleanedPath = withoutQuery
    .replace(/^(\.\/|\.\.\/)+/, "")
    .replace(/^\/+/, "");
  const rootedPath = cleanedPath ? `${base}${cleanedPath}` : base;
  const queryPart = query ? `?${query}` : "";
  const hashPart = hash ? `#${hash}` : "";
  
  return `${rootedPath}${queryPart}${hashPart}`;
}
