const { Sequelize } = require('sequelize');
require('dotenv').config({path: 'config.env'});

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD , {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    port: 3306,
});

module.exports = sequelize;