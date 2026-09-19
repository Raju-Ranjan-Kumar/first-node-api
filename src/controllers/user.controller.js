const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/ApiResponse");

// GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
    return sendSuccess(res, { message: "Current user retrieved successfully", data: req.user });
});

// GET /api/users
const getAllUsers = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const [users, total] = await Promise.all([
        User.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 }),
        User.countDocuments(),
    ]);

    return sendSuccess(res, {
        message: "User data retrieved successfully",
        data: users,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return sendSuccess(res, { message: "User data retrieved successfully", data: user });
});

// PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
    const { name, city } = req.body;
    const avatar = req.file && req.file.filename;

    const update = {};
    if (name !== undefined) update.name = name;
    if (city !== undefined) update.city = city;
    if (avatar) update.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, update, {
        returnDocument: "after",
        runValidators: true,
    });

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return sendSuccess(res, { message: "User data updated successfully", data: updatedUser });
});

// DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    return sendSuccess(res, { message: "User deleted successfully", data: deletedUser });
});

// GET /api/users/count
const countUsers = asyncHandler(async (req, res) => {
    const count = await User.countDocuments();
    return sendSuccess(res, { message: "User count retrieved successfully", data: { count } });
});

module.exports = { getMe, getAllUsers, getUserById, updateUser, deleteUser, countUsers };
