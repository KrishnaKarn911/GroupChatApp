
const path = require('path');
const User = require('../models/user');
const Sequelize = require('sequelize');



exports.signUpUser =  (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'views','signup', 'signup.html'));
}

exports.loginUser = (req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','signup','login.html'));
}

exports.getUsers = async(req,res)=>{
    try {
    const users = await User.findAll({
      where: {
        id: { [Sequelize.Op.ne]: req.user.id }
      }
    });
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }

}