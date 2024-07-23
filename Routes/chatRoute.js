const express = require('express');
const chatController=require('./../controllers/chatController');
//const authController = require('../controllers/authController');
const authoMiddleware = require('./../middleware/authorisationMiddleware');


const router = express.Router();


router.get('/chatPage', chatController.showChat);



router.get('/messages/:receiverId', authoMiddleware.userAuthorisation, chatController.getOneToOneMessage);
router.post('/message', authoMiddleware.userAuthorisation, chatController.postOneToOneMessage);



module.exports=router;





