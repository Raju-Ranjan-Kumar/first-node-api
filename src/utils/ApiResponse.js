function sendSuccess(res, { statusCode = 200, message = "Success", data = undefined, meta = undefined }) {
    const body = { status: statusCode, success: true, message };
    if (data !== undefined) body.data = data;
    if (meta !== undefined) body.meta = meta;
    return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
