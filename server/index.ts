import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRouter from "./apiRouter";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing limits supporting high-resolution image uploads comfortably
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Attach modular API endpoints
  app.use(apiRouter);

  // Setup Express handing of Vite development server OR Production final assets
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Development Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // For any unhandled path on API, fallback to index
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Crop Doctor PRO] Server live and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical server launch failure:", error);
});
