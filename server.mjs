import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon"
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const relative = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    const filePath = join(__dirname, relative);
    const root = normalize(__dirname + sep);
    if (!normalize(filePath).startsWith(root)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }
    const data = await readFile(filePath);
    res.setHeader("Content-Type", MIME[extname(filePath)] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    res.end(data);
  } catch (err) {
    res.statusCode = err?.code === "ENOENT" ? 404 : 500;
    res.end(err?.code === "ENOENT" ? "Not found" : "Server error");
  }
});

server.listen(PORT, () => {
  console.log(`Golf Swing Analyser running at http://localhost:${PORT}`);
});
