const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const authoMiddleware = require('./../middleware/authorisationMiddleware');


const router = express.Router();

router.post('/signup', authController.signup);
router.get('/signup', userController.signUpUser);

router.get('/login', userController.loginUser);
router.post('/login', authController.login);

router.get('/',authoMiddleware.userAuthorisation, userController.getUsers );



module.exports=router;
