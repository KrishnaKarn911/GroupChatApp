
const path = require('path');
const User = require('../models/user');
const Sequelize = require('sequelize');
const Group = require('../models/group');
const UserGroup = require('../models/userGroup');



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


exports.getUsersNotPartOfGroup = async (req, res) => {
  const groupName = req.params.groupName;
  
  if (!req.user) {
    return res.status(401).json({
      status: "fail",
      message: "unauthorised user"
    });
  }

  try {
    const groups = await Group.findAll({ where: { name: groupName } });
    const group = groups[0];
    
    if (!group) {
      return res.status(404).json({
        status: "fail",
        message: "Group not found"
      });
    }

  
    const groupUsers = await UserGroup.findAll({ where: { groupId: group.dataValues.id } });
   

    // Extract user IDs that are part of the group
    const groupUserIds = groupUsers.map(userGroup => userGroup.userId);

    console.log(groupUserIds);

    // Find users not part of the group
    const usersNotInGroup = await User.findAll({
      where: {
        id: {
          [Sequelize.Op.notIn]: groupUserIds
        }
      }
    });

    res.status(200).json({
      status: "success",
      data: usersNotInGroup
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

exports.getGroupUser = async(req,res)=>{
  if(!req.user){
    return res.status(401).json({
      status:"fail",
      message:"unauthorised user"
    })
  }

  try {
    const groups = await Group.findAll({ where: { name: req.params.groupName } });
    const group = groups[0];

    const userGroups  = await UserGroup.findAll({where:{groupId: group.dataValues.id}})

    const userIds = userGroups.map(userGroup => userGroup.dataValues.userId);

     const users = await User.findAll({ where: { id: userIds } });
    const userNames = users.map(user => ({
      id: user.id,
      name: user.name
    }));

    res.status(200).json({
      status:"success",
      data: userNames
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}


