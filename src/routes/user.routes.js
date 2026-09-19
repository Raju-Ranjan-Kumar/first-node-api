const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const upload = require("../middlewares/upload.middleware");
const { authenticate, authorize, selfOrAdmin } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { idParamValidator, updateUserValidator } = require("../validators/user.validator");

router.use(authenticate);

router.get("/me", userController.getMe);
router.get("/count", authorize("admin"), userController.countUsers);
router.get("/", authorize("admin"), userController.getAllUsers);
router.get("/:id", idParamValidator, validate, selfOrAdmin(), userController.getUserById);
router.put(
    "/:id",
    selfOrAdmin(),
    upload.single("avatar"),
    updateUserValidator,
    validate,
    userController.updateUser
);
router.delete("/:id", idParamValidator, validate, selfOrAdmin(), userController.deleteUser);

module.exports = router;
