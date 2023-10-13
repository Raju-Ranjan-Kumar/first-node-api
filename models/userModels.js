const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    city: String,
    email: String,
    avatar: String,
});

module.exports = mongoose.model("User", userSchema);