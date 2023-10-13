const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 8080;

// Connect to the database
mongoose.connect("mongodb://localhost:27017/createApi", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: false,
}).then(() => {
    console.log("Connected to MongoDB successfully");
}).catch((error) => {
    console.log("Error connecting to MongoDB:", error);
});

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Define the '/api' route for user-related operations
app.use('/api', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server is Running, & App is listening on port " + PORT);
    } else {
        console.log("Error occurred, server can't start", error);
    }
});