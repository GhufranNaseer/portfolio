import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { emailService } from "./email";

// Contact form validation schema with security limits
const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  email: z.string()
    .email("Please enter a valid email address")
    .max(254, "Email address too long") // RFC 5321 limit
    .trim(),
  subject: z.string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must not exceed 200 characters")
    .trim(),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must not exceed 5000 characters")
    .trim(),
});

// Simple in-memory rate limiting for contact form
const contactRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 submissions per 15 minutes per IP

// Secure IP extraction using Express's built-in req.ip (no manual header parsing)
function getClientIp(req: any): string {
  // Use req.ip exclusively - Express handles proxy headers securely with trust proxy setting
  // Manual header parsing would allow IP spoofing attacks
  return req.ip || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  // Don't rate limit if we can't determine IP
  if (!ip || ip === 'unknown') {
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

export async function registerRoutes(app: Express): Promise<Server> {
  // SEO endpoints
  app.get("/sitemap.xml", (req, res) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${req.protocol}://${req.get('host')}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${req.protocol}://${req.get('host')}/#about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${req.protocol}://${req.get('host')}/#services</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${req.protocol}://${req.get('host')}/#projects</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${req.protocol}://${req.get('host')}/#contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  app.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`;
    res.set('Content-Type', 'text/plain');
    res.send(robots);
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Rate limiting check with secure IP extraction
      const clientIp = getClientIp(req);
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({
          success: false,
          error: "Too many submissions. Please try again in 15 minutes."
        });
      }
      
      // Validate request body with field size limits
      const validatedData = contactFormSchema.parse(req.body);
      
      // Try to send contact email with graceful fallback
      const emailSent = await emailService.sendContactEmail(validatedData);
      
      if (!emailSent) {
        // Log the contact form submission even if email fails
        console.log("Contact form submission (email failed):", {
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message.substring(0, 100) + "...",
          timestamp: new Date().toISOString(),
          ip: clientIp
        });
        
        // Return success to user but log internally that email failed
        // This prevents exposing email configuration issues to potential attackers
        return res.json({
          success: true,
          message: "Thank you for your message. We have received your contact form submission."
        });
      }
      
      // Send auto-reply to user (optional, don't fail if it doesn't work)
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

  const httpServer = createServer(app);

  return httpServer;
}
