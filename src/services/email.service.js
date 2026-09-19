const nodemailer = require("nodemailer");
const env = require("../config/env");

const isSmtpConfigured = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const transporter = isSmtpConfigured
    ? nodemailer.createTransport({
          host: env.smtp.host,
          port: env.smtp.port,
          secure: env.smtp.secure,
          auth: { user: env.smtp.user, pass: env.smtp.pass },
      })
    : null;

async function sendEmail({ to, subject, text, html }) {
    if (!transporter) {
        console.log(`[email:dev-mode] SMTP not configured, logging email instead of sending.`);
        console.log(`  To: ${to}\n  Subject: ${subject}\n  ${text}`);
        return;
    }

    await transporter.sendMail({ from: env.smtp.from, to, subject, text, html });
}

async function sendOTPEmail(to, otp, purpose) {
    const subject =
        purpose === "verify_email" ? "Verify your email address" : "Reset your password";
    const text = `Your OTP code is ${otp}. It expires in ${env.otpExpiresInMinutes} minutes. If you did not request this, please ignore this email.`;
    const html = `<p>Your OTP code is <b>${otp}</b>.</p><p>It expires in ${env.otpExpiresInMinutes} minutes. If you did not request this, please ignore this email.</p>`;

    await sendEmail({ to, subject, text, html });
}

module.exports = { sendEmail, sendOTPEmail };
