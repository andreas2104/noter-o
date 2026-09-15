import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const root = process.argv[2] ?? "out";
const port = Number(process.argv[3] ?? 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (pathname.endsWith("/")) pathname += "index.html";

    const segments = pathname.split("/").filter(Boolean);
    const safe = normalize(join(root, ...segments));
    if (!safe.startsWith(join(root, sep))) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let file = safe;
    let isDir = false;
    try {
      isDir = (await stat(file)).isDirectory();
    } catch {
      if (extname(file)) throw new Error("missing");
      file += ".html";
      await stat(file);
    }
    if (isDir) {
      file = join(file, "index.html");
      try {
        await stat(file);
      } catch {
        // directory without index.html → try .html variant
        file = safe.replace(/\/$/, "") + ".html";
        await stat(file);
      }
    }

    const body = await readFile(file);
    const type = MIME[extname(file)] ?? "application/octet-stream";
    let cacheControl = "no-cache";
    if (pathname.startsWith("/_next/static/")) {
      cacheControl = "public, max-age=31536000, immutable";
    } else if (pathname.startsWith("/serwist/")) {
      cacheControl = "no-cache, no-store, must-revalidate";
    }

    const headers = {
      "Content-Type": type,
      "Cache-Control": cacheControl,
    };
    if (pathname.startsWith("/serwist/")) headers["Service-Worker-Allowed"] = "/";

    res.writeHead(200, headers);
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});