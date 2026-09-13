import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;

/**
 * Initializes and returns a Nodemailer transporter.
 * If SMTP environment variables are configured, uses real SMTP (Gmail, Resend, SendGrid, etc.).
 * Otherwise, generates an Ethereal test account with a live web preview for instant delivery testing.
 */
export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return cachedTransporter;
  }

  // Fallback for development: create an Ethereal test account on the fly
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return cachedTransporter;
}

/**
 * Core email sender
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const transporter = await getTransporter();
    const from = process.env.EMAIL_FROM || '"Life RPG" <noreply@liferpg.dev>';

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ""),
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n📬 [EMAIL DISPATCHED TO ${to}]`);
      console.log(`🔗 Live Preview URL: ${previewUrl}\n`);
    } else {
      console.log(`\n📬 [EMAIL SENT] MessageId: ${info.messageId} to ${to}\n`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to dispatch email",
    };
  }
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────

function baseEmailTemplate(contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Life RPG</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FDFBF7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #3D2B1F;
    }
    .container {
      max-width: 560px;
      margin: 30px auto;
      background-color: #F5E6D3;
      border: 1px solid rgba(212, 165, 116, 0.4);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(61, 43, 31, 0.05);
    }
    .header {
      background-color: #3D2B1F;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      color: #FDFBF7;
      margin: 0;
      font-size: 24px;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 32px 28px;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      background-color: #D4A574;
      color: #3D2B1F;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 8px;
      text-decoration: none;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(61, 43, 31, 0.1);
    }
    .footer {
      background-color: #ECE0CE;
      padding: 18px;
      text-align: center;
      font-size: 11px;
      color: #8C7A6B;
      border-top: 1px solid rgba(212, 165, 116, 0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Life RPG</h1>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      Sent from the sanctuary of Life RPG • Real-world progression gamified
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatches password reset instructions with recovery link
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}): Promise<SendEmailResult> {
  const content = `
    <h2 style="color: #3D2B1F; margin-top: 0;">Password Recovery Scroll 📜</h2>
    <p>Greetings Adventurer,</p>
    <p>We received a request to restore access to your Life RPG character credentials. Click the button below to inscribe a new passkey:</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn" style="color: #3D2B1F;">Set New Password</a>
    </div>

    <p style="font-size: 13px; color: #6E5D4F;">
      Or copy and paste this recovery URL into your browser:<br />
      <a href="${resetUrl}" style="color: #B58451; word-break: break-all;">${resetUrl}</a>
    </p>

    <p style="font-size: 12px; color: #8C7A6B; margin-top: 24px; border-top: 1px dashed rgba(212,165,116,0.3); padding-top: 16px;">
      ⏳ This recovery link will expire in <strong>1 hour</strong>. If you did not request this recovery scroll, no action is needed — your account remains safely guarded.
    </p>
  `;

  return sendEmail({
    to,
    subject: "📜 [Life RPG] Reset Your Adventurer Passkey",
    html: baseEmailTemplate(content),
  });
}

/**
 * Dispatches welcome email upon signup
 */
export async function sendWelcomeEmail({ to }: { to: string }): Promise<SendEmailResult> {
  const appUrl = process.env.AUTH_URL || "http://localhost:3000";
  const content = `
    <h2 style="color: #3D2B1F; margin-top: 0;">Welcome to the Guild! ⚔️</h2>
    <p>Hail Adventurer,</p>
    <p>Your character has been forged. From this moment on, your daily habits, workouts, and study sessions earn real server-validated XP, Gold, and titles.</p>
    
    <div style="background-color: #FDFBF7; border: 1px solid rgba(212,165,116,0.3); border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="margin-top: 0; font-size: 15px; color: #3D2B1F;">🌟 Your Journey Begins:</h3>
      <ul style="padding-left: 20px; font-size: 13px; color: #6E5D4F; margin-bottom: 0;">
        <li><strong>Level Up:</strong> Complete tasks to unlock elements in your Study Room.</li>
        <li><strong>Three Attributes:</strong> Grow Wisdom (learning), Vitality (health), and Craft (work).</li>
        <li><strong>Maintain Momentum:</strong> Complete at least 1 quest each day to unlock up to a 1.5× XP multiplier.</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}/app" class="btn" style="color: #3D2B1F;">Enter Your Sanctuary</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: "✨ [Life RPG] Welcome to Your Adventure!",
    html: baseEmailTemplate(content),
  });
}

/**
 * Dispatches daily streak reminder alert
 */
export async function sendStreakWarningEmail({
  to,
  currentStreak,
  multiplier,
}: {
  to: string;
  currentStreak: number;
  multiplier: number;
}): Promise<SendEmailResult> {
  const appUrl = process.env.AUTH_URL || "http://localhost:3000";
  const content = `
    <h2 style="color: #C2593F; margin-top: 0;">🔥 Your Daily Flame is at Risk!</h2>
    <p>Greetings Adventurer,</p>
    <p>Twilight is approaching, and today's quest log awaits your deed. Your <strong>${currentStreak}-day momentum streak</strong> and active <strong>${multiplier}× XP Multiplier</strong> will extinguish at midnight unless you complete at least one quest!</p>
    
    <div style="text-align: center;">
      <a href="${appUrl}/app" class="btn" style="background-color: #C2593F; color: #FFFFFF;">Defend Your Streak Now</a>
    </div>

    <p style="font-size: 12px; color: #8C7A6B;">
      Keep the flame burning. Even a quick 5-minute task or a tall glass of water will protect your momentum!
    </p>
  `;

  return sendEmail({
    to,
    subject: `🔥 [Life RPG] Your ${currentStreak}-Day Streak is at Risk!`,
    html: baseEmailTemplate(content),
  });
}
