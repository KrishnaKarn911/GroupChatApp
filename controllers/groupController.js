const Group = require('../models/group');
const Message = require('../models/messages');
const User=require('./../models/user');
const UserGroup=require('./../models/userGroup');

exports.createGroup = async(req,res)=>{
    console.log(req.body);
    if(!req.user){
        return res.status(401).json({
            message: "unauthorised user"
        })
    }

    try{
        const group = await Group.create({
            name: req.body.name,
        })

       for(const id of req.body.users){
            await UserGroup.create(
               {
                groupId: group.id,
                userId: id
               }
            )
       }
       await UserGroup.create(
        {groupId: group.id,
         userId: req.user.id
        },
       
       )

        res.status(201).json({
            status: "success",
            group,
        })
    }catch(err){
        console.log(err);
    }
}


exports.getAllGroup = async(req,res)=>{
    try{
        var groupNameArray=[];
        console.log("In getgroup controller");
        const userId = req.user.id;
        const groups = await UserGroup.findAll({where:{userId: userId}});
        const groupIds = groups.map(group => group.dataValues.groupId);

        console.log(groupIds);
        for(var i=0;i<groupIds.length;i++){
            const group = await Group.findOne({where:{id:groupIds[i]}})
            groupName=group.dataValues.name;
            groupNameArray.push(groupName);

        }

        res.status(200).json({
            status:"success",
            groupNameArray
        })
    }catch(err){

    }
}


exports.sendGroupMessage = async (req, res) => {
  const { message, groupName } = req.body;
  const senderId = req.user.id; // Assuming req.user contains the authenticated user's information
  const groupId = await getGroupIdByName(groupName); // Function to get group ID by its name

  if (!groupId) {
    return res.status(404).json({ error: 'Group not found' });
  }

  try {
    const newMessage = await Message.create({
      message: message,
      sender_id: senderId,
      groupId: groupId,
      receiver_id: null // Explicitly setting receiver_id to null for group messages
    });

  const groupUserMessage = {
      id: newMessage.id,
      sender_id: newMessage.sender_id,
      message: newMessage.message,
      createdAt: newMessage.createdAt,
      userName: req.user.name,
      isSent: true,
      sender: {id:req.user.id, name:req.user.id}
    };
    res.status(201).json({ message: groupUserMessage });
  } catch (err) {
    console.error('Error sending group message:', err);
    res.status(500).json({ error: 'Failed to send group message' });
  }
};

// Function to get group ID by its name
async function getGroupIdByName(groupName) {
  const group = await Group.findOne({ where: { name: groupName } });
  return group ? group.id : null;
}



exports.getGroupMessages = async (req, res) => {
  const groupName = req.params.groupName;
  const userId = req.user.id;
  console.log(groupName);

  if (!userId) {
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized User',
    });
  }

  try {
    const group = await Group.findOne({ where: { name: groupName } });

    if (!group) {
      return res.status(404).json({
        status: 'fail',
        message: "Group doesn't exist",
      });
    }

    const userGroup = await UserGroup.findOne({
      where: {
        userId: userId,
        groupId: group.id,
      },
    });

    if (!userGroup) {
      return res.status(403).json({
        status: 'fail',
        message: 'User is not part of this group',
      });
    }

    const messages = await Message.findAll({
      where: { groupId: group.id },
      include: [
        {
          model: User,
          as: 'sender', // Ensure this matches the alias in the association
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const userGroupMessages = messages.map(msg => ({
      id: msg.id,
      sender_id: msg.sender_id,
      sender: msg.sender,
      message: msg.message,
      createdAt: msg.createdAt,
      isSent: msg.sender_id === userId
    }));

    res.status(200).json({
      status: 'success',
      data: userGroupMessages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};