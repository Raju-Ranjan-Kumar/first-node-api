const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { authLimiter, otpLimiter } = require("../middlewares/rateLimiter.middleware");
const {
    signupValidator,
    loginValidator,
    otpValidator,
    emailOnlyValidator,
    resetPasswordValidator,
    changePasswordValidator,
} = require("../validators/auth.validator");

router.post("/signup", authLimiter, signupValidator, validate, authController.signup);
router.post("/verify-email", authLimiter, otpValidator, validate, authController.verifyEmail);
router.post("/resend-otp", otpLimiter, emailOnlyValidator, validate, authController.resendOtp);
router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post(
    "/forgot-password",
    otpLimiter,
    emailOnlyValidator,
    validate,
    authController.forgotPassword
);
router.post(
    "/reset-password",
    authLimiter,
    resetPasswordValidator,
    validate,
    authController.resetPassword
);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.post(
    "/change-password",
    authenticate,
    authLimiter,
    changePasswordValidator,
    validate,
    authController.changePassword
);

module.exports = router;
