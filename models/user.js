const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100]
        }
    },
    confirmPassword: {
        type: DataTypes.VIRTUAL,
        validate: {
            isEqual(value) {
                if (value !== this.password) {
                    throw new Error('Passwords do not match');
                }
            }
        }
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        
    }
}, {
    timestamps: true,
    hooks: {
        beforeSave: async (user) => {
            try {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                    user.confirmPassword = undefined;
                }
            } catch (err) {
                throw err;
            }
        }
    }
});

module.exports = User;
