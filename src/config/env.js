const dotenv = require("dotenv");

dotenv.config();

const required = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 8080,
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

    mongodbUri: process.env.MONGODB_URI,

    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },

    otpExpiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES) || 10,

    smtp: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.EMAIL_FROM || "No Reply <no-reply@example.com>",
    },

    isProduction: (process.env.NODE_ENV || "development") === "production",
};

module.exports = env;
