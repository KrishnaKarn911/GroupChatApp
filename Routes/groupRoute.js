const express = require('express');
const groupController=require('./../controllers/groupController');
//const authController = require('../controllers/authController');
const authoMiddleware = require('./../middleware/authorisationMiddleware');


const router = express.Router();


router.post('/', authoMiddleware.userAuthorisation,groupController.createGroup);
router.get('/', authoMiddleware.userAuthorisation, groupController.getAllGroup);





module.exports=router;





