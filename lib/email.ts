const SMTP_HOST = process.env.SMTP_SERVER || process.env.MTP_SERVER;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USERNAME;
const SMTP_PASS = process.env.SMTP_PASSWORD;
const FROM_EMAIL = process.env.FROM_EMAIL;

export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS && FROM_EMAIL);
}

export async function sendPasswordResetEmail(to: string, resetLink: string, mobile?: string): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    const mobileNote = mobile ? `\nWe have also sent this link to your registered mobile for your reference.` : "";
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "MedQuize – Reset your password",
      text: `You requested a password reset. Click the link below to set a new password (valid for 1 hour):\n\n${resetLink}\n\nIf you didn't request this, ignore this email.${mobileNote}`,
      html: `<p>You requested a password reset. Click the link below to set a new password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you didn't request this, ignore this email.</p>${mobile ? "<p>We have also sent this link to your registered mobile.</p>" : ""}`,
    });
    return true;
  } catch (e) {
    console.error("Send email error:", e);
    return false;
  }
}
