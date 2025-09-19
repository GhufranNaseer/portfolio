// server/index.ts
import express2 from "express";
import compression from "compression";

// server/routes.ts
import { createServer } from "http";
import { z } from "zod";

// server/email.ts
import nodemailer from "nodemailer";
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}
function escapeAndBreaklines(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}
var EmailService = class {
  transporter = null;
  constructor() {
    this.initializeTransporter();
  }
  initializeTransporter() {
    const config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "me.ghufrannaseer@gmail.com",
        pass: process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || ""
      }
    };
    if (!config.auth.pass) {
      console.warn("Email password not configured. Contact form emails will not be sent.");
      return;
    }
    this.transporter = nodemailer.createTransport(config);
  }
  async sendContactEmail(data) {
    if (!this.transporter) {
      console.error("Email transporter not initialized");
      return false;
    }
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || "me.ghufrannaseer@gmail.com",
        to: "me.ghufrannaseer@gmail.com",
        // Your email to receive messages
        replyTo: data.email,
        // User's email for easy reply
        subject: `Portfolio Contact: ${data.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
              <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
              <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; line-height: 1.6;">
                ${escapeAndBreaklines(data.message)}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>This email was sent from your portfolio website contact form.</p>
              <p>Reply directly to this email to respond to ${escapeHtml(data.name)}.</p>
            </div>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

---
This email was sent from your portfolio website contact form.
Reply directly to this email to respond to ${data.name}.
        `
      };
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Contact email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Failed to send contact email:", error);
      return false;
    }
  }
  async sendAutoReply(userEmail, userName) {
    if (!this.transporter) {
      return false;
    }
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || "me.ghufrannaseer@gmail.com",
        to: userEmail,
        subject: "Thank you for contacting me!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank you for reaching out, ${escapeHtml(userName)}!</h2>
            
            <p>I've received your message and will get back to you as soon as possible, typically within 24-48 hours.</p>
            
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Check out my latest projects on my portfolio</li>
              <li>Connect with me on <a href="https://linkedin.com/in/muhammadghufran" style="color: #2563eb;">LinkedIn</a></li>
              <li>View my code on <a href="https://github.com/muhammadghufran" style="color: #2563eb;">GitHub</a></li>
            </ul>
            
            <p>Looking forward to working with you!</p>
            
            <p>Best regards,<br>
            <strong>Muhammad Ghufran</strong><br>
            Full Stack Developer & AI Integration Specialist</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>This is an automated response to confirm receipt of your message.</p>
            </div>
          </div>
        `
      };
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Failed to send auto-reply:", error);
      return false;
    }
  }
};
var emailService = new EmailService();

// server/routes.ts
var contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").trim(),
  email: z.string().email("Please enter a valid email address").max(254, "Email address too long").trim(),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject must not exceed 200 characters").trim(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5e3, "Message must not exceed 5000 characters").trim()
});
var contactRateLimit = /* @__PURE__ */ new Map();
var RATE_LIMIT_WINDOW = 15 * 60 * 1e3;
var RATE_LIMIT_MAX_REQUESTS = 5;
function getClientIp(req) {
  return req.ip || "unknown";
}
function checkRateLimit(ip) {
  if (!ip || ip === "unknown") {
    return true;
  }
  const now = Date.now();
  const userLimit = contactRateLimit.get(ip);
  if (!userLimit || now > userLimit.resetTime) {
    contactRateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  userLimit.count++;
  return true;
}
async function registerRoutes(app2) {
  app2.get("/sitemap.xml", (req, res) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${req.protocol}://${req.get("host")}/</loc>
    <lastmod>${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${req.protocol}://${req.get("host")}/#about</loc>
    <lastmod>${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${req.protocol}://${req.get("host")}/#services</loc>
    <lastmod>${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${req.protocol}://${req.get("host")}/#projects</loc>
    <lastmod>${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${req.protocol}://${req.get("host")}/#contact</loc>
    <lastmod>${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
    res.set("Content-Type", "application/xml");
    res.send(sitemap);
  });
  app2.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml`;
    res.set("Content-Type", "text/plain");
    res.send(robots);
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          success: false,
          error: "Too many submissions. Please try again in 15 minutes."
        });
      }
      const validatedData = contactFormSchema.parse(req.body);
      const emailSent = await emailService.sendContactEmail(validatedData);
      if (!emailSent) {
        console.log("Contact form submission (email failed):", {
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message.substring(0, 100) + "...",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          ip: clientIp
        });
        return res.json({
          success: true,
          message: "Thank you for your message. We have received your contact form submission."
        });
      }
      try {
        await emailService.sendAutoReply(validatedData.email, validatedData.name);
      } catch (error) {
        console.warn("Auto-reply failed:", error);
      }
      res.json({
        success: true,
        message: "Contact form submitted successfully!"
      });
    } catch (error) {
      console.error("Contact form error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Invalid form data",
          details: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: "An unexpected error occurred. Please try again later."
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.set("trust proxy", 1);
app.use(compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  // Good balance of speed vs compression
  threshold: 1024
  // Only compress files larger than 1KB
}));
app.use((req, res, next) => {
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Expires", new Date(Date.now() + 31536e6).toUTCString());
  } else if (req.url.match(/\.html$/) || req.path === "/") {
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Cache-Control", "public, max-age=300");
    } else {
      res.setHeader("Cache-Control", "no-cache");
    }
  }
  next();
});
app.use(express2.json({ limit: "100kb" }));
app.use(express2.urlencoded({ extended: false, limit: "100kb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, () => {
    log(`serving on http://localhost:${port}`);
  });
})();
