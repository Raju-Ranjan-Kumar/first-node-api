const { body } = require("express-validator");

const passwordRule = body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain a number");

const signupValidator = [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("city").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    passwordRule,
];

const loginValidator = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
];

const otpValidator = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("otp").trim().notEmpty().withMessage("OTP is required").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits").isNumeric(),
];

const emailOnlyValidator = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email").normalizeEmail(),
];

const resetPasswordValidator = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("otp").trim().notEmpty().withMessage("OTP is required").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits").isNumeric(),
    body("newPassword")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/)
        .withMessage("Password must contain a lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain an uppercase letter")
        .matches(/\d/)
        .withMessage("Password must contain a number"),
];

const changePasswordValidator = [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/)
        .withMessage("Password must contain a lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain an uppercase letter")
        .matches(/\d/)
        .withMessage("Password must contain a number")
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage("New password must be different from the current password"),
];

module.exports = {
    signupValidator,
    loginValidator,
    otpValidator,
    emailOnlyValidator,
    resetPasswordValidator,
    changePasswordValidator,
};
