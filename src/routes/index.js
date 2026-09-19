const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");

router.get("/", (req, res) => {
    res.json({ status: 200, success: true, message: "App is running..." });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;
