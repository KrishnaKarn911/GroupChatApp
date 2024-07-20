const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Message;
