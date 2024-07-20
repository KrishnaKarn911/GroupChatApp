const express = require('express');
const chatController = require('../controllers/chatController');
//const authController = require('../controllers/authController');


const router = express.Router();


router.get('/chatPage', chatController.showChat);





module.exports=router;