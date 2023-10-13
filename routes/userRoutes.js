const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});


const upload = multer({ storage });


router.get('/', userController.appRuning);
router.post('/createUserData', upload.single('avatar'), userController.createUser);
router.get('/getUserData', userController.getUserData);
router.get('/countUserData', userController.countUserData);
router.get('/getUserData/:id', userController.getUserDataById);
router.put('/updateUserData/:id', upload.single('avatar'), userController.updateUserData);
router.delete('/deleteUserData/:id', userController.deleteUserData);


module.exports = router;