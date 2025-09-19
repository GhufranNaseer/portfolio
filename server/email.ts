import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}

// HTML escape utility to prevent injection attacks
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Convert newlines to HTML breaks safely
function escapeAndBreaklines(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Using Gmail SMTP as default - can be configured via environment variables
    const config: EmailConfig = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'me.ghufrannaseer@gmail.com',
        pass: process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || '',
      }
    };

    if (!config.auth.pass) {
      console.warn('Email password not configured. Contact form emails will not be sent.');
      return;
    }

    this.transporter = nodemailer.createTransport(config);
  }

  async sendContactEmail(data: ContactEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'me.ghufrannaseer@gmail.com',
        to: 'me.ghufrannaseer@gmail.com', // Your email to receive messages
        replyTo: data.email, // User's email for easy reply
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
      console.log('Contact email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send contact email:', error);
      return false;
    }
  }

  async sendAutoReply(userEmail: string, userName: string): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'me.ghufrannaseer@gmail.com',
        to: userEmail,
        subject: 'Thank you for contacting me!',
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
      console.error('Failed to send auto-reply:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();