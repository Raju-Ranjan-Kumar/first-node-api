const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: env.clientUrl,
        credentials: true,
    })
);
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/public", express.static("public"));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
