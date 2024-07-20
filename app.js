const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
require('dotenv').config({path: 'config.env'});
const path=require('path');
const cors=require('cors');

const userRoutes=require('./Routes/userRoutes');
const chatsRoutes=require('./Routes/chatRoute');


const User = require('./models/user');
const Message=require('./models/messages');

const app=express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin:'*',
}))

app.use('/user', userRoutes);
app.use('/chats',chatsRoutes);

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

sequelize.sync({ alter: true }).then(()=>{
    console.log('Database Synced')
}).catch(err=>{
    console.log(err);
})

app.listen(3000,()=>{
    console.log("Server Started in Port: 3000")
})