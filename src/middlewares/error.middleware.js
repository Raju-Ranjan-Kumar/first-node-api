const env = require("../config/env");
const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    let details = err.details;

    if (err.name === "ValidationError") {
        statusCode = 422;
        message = "Validation failed";
        details = Object.values(err.errors).map((e) => e.message);
    } else if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `${field} already exists`;
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid value for ${err.path}`;
    } else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    } else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    if (!err.isOperational && statusCode === 500) {
        console.error(err);
    }

    const body = { status: statusCode, success: false, message };
    if (details) body.details = details;
    if (!env.isProduction && statusCode === 500) body.stack = err.stack;

    res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
