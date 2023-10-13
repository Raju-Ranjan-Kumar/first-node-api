const User = require("../models/userModels");


// Root define
exports.appRuning = (req, res) => {
    console.log(req, res)
    console.log('Default route accessed.');
    res.json({ message: 'App is running...' });
};


// Define a route to create a new user
exports.createUser = async (req, res) => {
    const { name, city, email } = req.body;
    const avatar = req.file && req.file.filename;

    if (!name || !email || !city) {
        return res.status(400).json({
            status: 400,
            error: 'All fields are required',
        });
    }

    try {
        const newUser = new User({
            name,
            email,
            city,
            avatar,
        });

        const savedUser = await newUser.save();

        return res.status(201).json({
            status: 201,
            message: 'User created successfully',
            data: savedUser,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: 'Internal server error',
        });
    }
};


// Define a route to get all user data from the database
exports.getUserData = async (req, res) => {
    try {
        const users = await User.find();

        if (users.length > 0) {
            res.status(200).json({
                status: 200,
                message: 'User data retrieved successfully',
                data: users,
            });
        } else {
            res.status(404).json({
                status: 404,
                error: 'No user data found',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: 'Internal server error',
        });
    }
};


// Define a route to get user data by ID
exports.getUserDataById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                status: 404,
                error: 'User not found',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'User data retrieved successfully',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: 'Internal server error',
        });
    }
};


// Define a route to count user data
exports.countUserData = async (req, res) => {
    try {
        const count = await User.countDocuments();

        res.status(200).json({
            status: 200,
            message: 'Data count retrieved successfully',
            count,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: 'Internal server error',
        });
    }
};


// Define a route to update user data by ID
exports.updateUserData = async (req, res) => {
    const { id } = req.params;
    const { name, city, email } = req.body;
    const avatar = req.file && req.file.filename; // Get the uploaded file name

    if (!name || !city || !email) {
        return res.status(400).json({
            status: 400,
            error: 'All fields are required',
        });
    }

    try {
        const updatedUserData = {
            name,
            city,
            email,
        };

        if (avatar) {
            // If a new avatar file is uploaded, update the avatar field
            updatedUserData.avatar = avatar;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updatedUserData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 404,
                error: 'User not found',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'User data updated successfully',
            updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: 'Internal server error',
        });
    }
};


// Define a route to delete user data by ID
exports.deleteUserData = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndRemove(id);

        if (!deletedUser) {
            return res.status(404).json({
                status: 404,
                error: 'User not found',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'User deleted successfully',
            deletedUser,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: 'Internal server error',
        });
    }
};