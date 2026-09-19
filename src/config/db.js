const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
    mongoose.set("strictQuery", true);

    try {
        await mongoose.connect(env.mongodbUri);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;
