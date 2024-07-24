const Message = require("../models/messages");
const Sequelize = require('sequelize');
const path=require('path');
const User = require("../models/user");




exports.showChat = async(req,res)=>{
    res.sendFile(path.join(__dirname,'..', 'views','signup', 'chatPage.html'));
}


exports.getOneToOneMessage = async (req, res) => {
  const receiverId = parseInt(req.params.receiverId);
  const loggedInUserId = req.user.id;

  try {
    // Fetch the receiver's details
    const receiver = await User.findOne({ where: { id: receiverId } });

    // Handle the case where the receiver is not found
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const receiverName = receiver.name;

    const messages = await Message.findAll({
      where: {
        [Sequelize.Op.or]: [
          { sender_id: loggedInUserId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: loggedInUserId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    const userMessages = messages.map(msg => ({
      id: msg.id,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      message: msg.message,
      createdAt: msg.createdAt,
      userName: msg.sender_id === loggedInUserId ? req.user.name : receiverName, 
      isSent: msg.sender_id === loggedInUserId
    }));

    res.json({ userMessages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'An error occurred while fetching messages' });
  }
};

exports.postOneToOneMessage = async (req, res) => {
  const { message, receiverId } = req.body;
  

  if (!message || !receiverId) {
    return res.status(400).json({ error: 'Message and receiverId are required' });
  }

  try {
    const newMessage = await Message.create({
      message,
      sender_id: req.user.id,
      receiver_id: receiverId,
      userName: req.user.name,
      groupId: null // Sender's name
    });

    res.json({ message: newMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'An error occurred while sending the message' });
  }
};
