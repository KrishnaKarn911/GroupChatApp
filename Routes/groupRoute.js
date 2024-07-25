const express = require('express');
const groupController=require('./../controllers/groupController');
//const authController = require('../controllers/authController');
const authoMiddleware = require('./../middleware/authorisationMiddleware');


const router = express.Router();


router.post('/groupmessages', authoMiddleware.userAuthorisation,groupController.createGroup);
router.get('/groupmessages', authoMiddleware.userAuthorisation, groupController.getAllGroup);
router.post('/groupmessages/:groupName',authoMiddleware.userAuthorisation, groupController.sendGroupMessage);
router.get('/groupmessages/:groupName', authoMiddleware.userAuthorisation,groupController.getGroupMessages);





module.exports=router;





