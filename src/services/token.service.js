const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("../config/env");

function generateAccessToken(user) {
    return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwt.accessSecret, {
        expiresIn: env.jwt.accessExpiresIn,
    });
}

function generateRefreshToken(user) {
    const jti = crypto.randomUUID();
    const token = jwt.sign({ sub: user._id.toString(), jti }, env.jwt.refreshSecret, {
        expiresIn: env.jwt.refreshExpiresIn,
    });
    return token;
}

function verifyAccessToken(token) {
    return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
