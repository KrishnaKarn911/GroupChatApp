const express = require('express');
const chatController = require('../controllers/chatController');
//const authController = require('../controllers/authController');
const authoMiddleware = require('./../middleware/authorisationMiddleware');


const router = express.Router();


router.get('/chatPage', chatController.showChat);

router.post('/message',authoMiddleware.userAuthorisation, chatController.sendMessage);
router.get('/message', authoMiddleware.userAuthorisation, chatController.getMessage)





module.exports=router;