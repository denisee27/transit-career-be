import nodemailer from "nodemailer";
import { env } from "../config/index.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export async function sendMagicLinkEmail(email, magicLink) {
  await transporter.sendMail({
    from: `"TransitCareer" <${env.SMTP_USER}>`,
    to: email,
    subject: "Your TransitCareer Login Link",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; background: #fff;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">TransitCareer</span>
        </div>
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 600; margin: 0 0 12px;">Sign in to your account</h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
          Click the button below to sign in. This link expires in 15 minutes and can only be used once.
        </p>
        <a href="${magicLink}" style="display: inline-block; padding: 12px 28px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: -0.01em;">
          Sign In to TransitCareer
        </a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 36px; line-height: 1.5;">
          If you did not request this link, you can safely ignore this email. Your account is secure.
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px;" />
        <p style="color: #cbd5e1; font-size: 12px; margin: 0;">TransitCareer — Your path to global opportunities</p>
      </div>
    `,
  });
}
