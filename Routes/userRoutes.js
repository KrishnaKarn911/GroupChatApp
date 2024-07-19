const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


const router = express.Router();

router.post('/signup', authController.signup);
router.get('/signup', userController.signUpUser);



module.exports=router;