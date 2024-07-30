const sequelize = require('../config/database');
const Message = require('./message');
const ArchivedMessage = require('./archivedMessage');

async function archiveOldMessages() {
  try {
    
    const messagesToArchive = await Message.findAll({
      where: {
        createdAt: {
          [sequelize.Sequelize.Op.lt]: new Date(new Date() - 24 * 60 * 60 * 1000)
        }
      }
    });

  
    const archivedMessages = messagesToArchive.map(message => ({
      id: message.id,
      message: message.message,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      groupId: message.groupId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    }));

    await ArchivedMessage.bulkCreate(archivedMessages);

    
    await Message.destroy({
      where: {
        createdAt: {
          [sequelize.Sequelize.Op.lt]: new Date(new Date() - 24 * 60 * 60 * 1000)
        }
      }
    });

    console.log('Old messages archived successfully');
  } catch (error) {
    console.error('Error archiving messages:', error);
  }
}

archiveOldMessages();
