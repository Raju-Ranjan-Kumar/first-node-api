const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../services/token.service");
const User = require("../models/user.model");

const authenticate = asyncHandler(async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        throw new ApiError(401, "Authentication required");
    }

    let payload;
    try {
        payload = verifyAccessToken(token);
    } catch (error) {
        throw new ApiError(401, error.name === "TokenExpiredError" ? "Token expired" : "Invalid token");
    }

    const user = await User.findById(payload.sub);
    if (!user) {
        throw new ApiError(401, "User no longer exists");
    }

    req.user = user;
    next();
});

function authorize(...roles) {
    return function (req, res, next) {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }
        next();
    };
}

function selfOrAdmin(paramName = "id") {
    return function (req, res, next) {
        const targetId = req.params[paramName];
        const isSelf = req.user && req.user._id.toString() === targetId;
        const isAdmin = req.user && req.user.role === "admin";

        if (!isSelf && !isAdmin) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }
        next();
    };
}

module.exports = { authenticate, authorize, selfOrAdmin };
