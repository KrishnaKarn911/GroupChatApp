const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Group = require('./group');

const UserGroup = sequelize.define('UserGroup', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    }
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Group,
      key: 'id',
    }
  }
}, { timestamps: true });

module.exports = UserGroup;
