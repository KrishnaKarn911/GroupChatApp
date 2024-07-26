const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Group = require('./group');


const GroupAdmin = sequelize.define('GroupAdmin', {
  AdminUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references:{
        model: User,
        key: 'id'
    }
  },
  GroupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Group,
        key: 'id',
    }
  }
}, { timestamps: true });

module.exports = GroupAdmin;