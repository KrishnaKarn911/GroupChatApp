const express = require('express');
const groupController=require('./../controllers/groupController');
//const authController = require('../controllers/authController');
const authoMiddleware = require('./../middleware/authorisationMiddleware');


const router = express.Router();


router.post('/groupmessages', authoMiddleware.userAuthorisation,groupController.createGroup);
router.get('/groupmessages', authoMiddleware.userAuthorisation, groupController.getAllGroup);
router.post('/groupmessages/:groupName',authoMiddleware.userAuthorisation, groupController.sendGroupMessage);
router.get('/groupmessages/:groupName', authoMiddleware.userAuthorisation,groupController.getGroupMessages);

router.post('/add-users/:groupName', authoMiddleware.userAuthorisation, groupController.addUserToGroup);
router.post('/remove-users/:groupName', authoMiddleware.userAuthorisation, groupController.removeUserFromGroup);






module.exports=router;





