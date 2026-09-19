const { body, param } = require("express-validator");

const idParamValidator = [param("id").isMongoId().withMessage("Invalid user id")];

const updateUserValidator = [
    param("id").isMongoId().withMessage("Invalid user id"),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").isLength({ max: 100 }),
    body("city").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body("email").not().exists().withMessage("Email cannot be changed via this endpoint"),
    body("password").not().exists().withMessage("Use the reset-password endpoint to change password"),
];

module.exports = { idParamValidator, updateUserValidator };
