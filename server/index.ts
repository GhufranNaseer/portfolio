import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
// Trust only the first proxy (typical reverse proxy setup) to prevent IP spoofing
app.set('trust proxy', 1);

// Compression middleware - compress all responses (gzip/brotli)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Good balance of speed vs compression
  threshold: 1024, // Only compress files larger than 1KB
}));

// Performance headers for static assets
app.use((req, res, next) => {
  // Cache static assets for 1 year
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
  }
  // Cache HTML for 5 minutes in production, no-cache in development
  else if (req.url.match(/\.html$/) || req.path === '/') {
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
  next();
});

app.use(express.json({ limit: '100kb' })); // Appropriate limit for contact forms
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, () => {
  log(`serving on http://localhost:${port}`);
});
})();
