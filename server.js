const app = require("./src/app");
const connectDB = require("./src/config/db");
const env = require("./src/config/env");

async function start() {
    await connectDB();

    const server = app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} [${env.nodeEnv}]`);
    });

    process.on("unhandledRejection", (error) => {
        console.error("Unhandled rejection:", error);
        server.close(() => process.exit(1));
    });
}

start();
