const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const otpSchema = new mongoose.Schema(
    {
        codeHash: { type: String, required: true },
        purpose: { type: String, enum: ["verify_email", "reset_password"], required: true },
        expiresAt: { type: Date, required: true },
        attempts: { type: Number, default: 0 },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false,
        },
        city: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        avatar: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: otpSchema,
            default: null,
            select: false,
        },
        refreshTokenHash: {
            type: String,
            default: null,
            select: false,
        },
        passwordChangedAt: {
            type: Date,
            select: false,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
    if (!this.isNew) this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.setOTP = function setOTP(rawOtp, purpose, expiresInMinutes) {
    this.otp = {
        codeHash: crypto.createHash("sha256").update(rawOtp).digest("hex"),
        purpose,
        expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
        attempts: 0,
    };
};

userSchema.methods.verifyOTP = function verifyOTP(rawOtp, purpose) {
    if (!this.otp || this.otp.purpose !== purpose) return { valid: false, reason: "not_found" };
    if (this.otp.expiresAt.getTime() < Date.now()) return { valid: false, reason: "expired" };
    if (this.otp.attempts >= 5) return { valid: false, reason: "too_many_attempts" };

    const candidateHash = crypto.createHash("sha256").update(rawOtp).digest("hex");
    if (candidateHash !== this.otp.codeHash) return { valid: false, reason: "mismatch" };

    return { valid: true };
};

userSchema.methods.clearOTP = function clearOTP() {
    this.otp = null;
};

userSchema.methods.setRefreshToken = async function setRefreshToken(rawToken) {
    this.refreshTokenHash = rawToken
        ? crypto.createHash("sha256").update(rawToken).digest("hex")
        : null;
};

userSchema.methods.matchRefreshToken = function matchRefreshToken(rawToken) {
    if (!this.refreshTokenHash || !rawToken) return false;
    const candidateHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    return candidateHash === this.refreshTokenHash;
};

userSchema.methods.toJSON = function toJSON() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.otp;
    delete obj.refreshTokenHash;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model("User", userSchema);
