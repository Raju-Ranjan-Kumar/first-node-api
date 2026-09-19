const ms = require("ms");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/ApiResponse");
const { generateOTP } = require("../utils/otp");
const { sendOTPEmail } = require("../services/email.service");
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require("../services/token.service");
const env = require("../config/env");

const REFRESH_COOKIE_NAME = "refreshToken";

function refreshCookieOptions() {
    return {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "strict",
        path: "/api/auth",
        maxAge: ms(env.jwt.refreshExpiresIn),
    };
}

async function issueTokens(res, user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.setRefreshToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return accessToken;
}

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
    const { name, email, city, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "An account with this email already exists");
    }

    const user = new User({ name, email, city, password });

    const otp = generateOTP();
    user.setOTP(otp, "verify_email", env.otpExpiresInMinutes);
    await user.save();

    await sendOTPEmail(user.email, otp, "verify_email");

    return sendSuccess(res, {
        statusCode: 201,
        message: "Account created. An OTP has been sent to your email for verification.",
        data: { email: user.email },
    });
});

// POST /api/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select("+otp");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        return sendSuccess(res, { message: "Email is already verified" });
    }

    const result = user.verifyOTP(otp, "verify_email");
    if (!result.valid) {
        if (result.reason === "mismatch") {
            user.otp.attempts += 1;
            await user.save({ validateBeforeSave: false });
        }
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    user.clearOTP();

    const accessToken = await issueTokens(res, user);

    return sendSuccess(res, {
        message: "Email verified successfully",
        data: { user, accessToken },
    });
});

// POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const purpose = req.body.purpose === "reset_password" ? "reset_password" : "verify_email";

    const user = await User.findOne({ email });
    if (!user) {
        return sendSuccess(res, { message: "If the account exists, an OTP has been sent" });
    }

    if (purpose === "verify_email" && user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified");
    }

    const otp = generateOTP();
    user.setOTP(otp, purpose, env.otpExpiresInMinutes);
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(user.email, otp, purpose);

    return sendSuccess(res, { message: "If the account exists, an OTP has been sent" });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email before logging in");
    }

    const accessToken = await issueTokens(res, user);

    return sendSuccess(res, {
        message: "Logged in successfully",
        data: { user, accessToken },
    });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user) {
        const otp = generateOTP();
        user.setOTP(otp, "reset_password", env.otpExpiresInMinutes);
        await user.save({ validateBeforeSave: false });
        await sendOTPEmail(user.email, otp, "reset_password");
    }

    return sendSuccess(res, {
        message: "If the account exists, a password reset OTP has been sent",
    });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select("+otp +password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const result = user.verifyOTP(otp, "reset_password");
    if (!result.valid) {
        if (result.reason === "mismatch") {
            user.otp.attempts += 1;
            await user.save({ validateBeforeSave: false });
        }
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.password = newPassword;
    user.clearOTP();
    await user.setRefreshToken(null);
    await user.save();

    return sendSuccess(res, { message: "Password reset successfully. Please log in again." });
});

// POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
        throw new ApiError(401, "Refresh token missing");
    }

    let payload;
    try {
        payload = verifyRefreshToken(token);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(payload.sub).select("+refreshTokenHash");
    if (!user || !user.matchRefreshToken(token)) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = await issueTokens(res, user);

    return sendSuccess(res, { message: "Token refreshed", data: { accessToken } });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (token) {
        try {
            const payload = verifyRefreshToken(token);
            const user = await User.findById(payload.sub);
            if (user) {
                await user.setRefreshToken(null);
                await user.save({ validateBeforeSave: false });
            }
        } catch (error) {
            // token already invalid/expired - nothing to revoke
        }
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    return sendSuccess(res, { message: "Logged out successfully" });
});

module.exports = {
    signup,
    verifyEmail,
    resendOtp,
    login,
    forgotPassword,
    resetPassword,
    refreshToken,
    logout,
};
