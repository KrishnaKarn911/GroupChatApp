const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
require('dotenv').config({path: 'config.env'});
const path=require('path');
const cors=require('cors');

const userRoutes=require('./Routes/userRoutes');
const chatsRoutes=require('./Routes/chatRoute');
const groupRoute=require('./Routes/groupRoute');

const User = require('./models/user');
const Message=require('./models/messages');
const Group = require('./models/group');
const UserGroup=require('./models/userGroup');


const app=express();

const http = require('http').Server(app)
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin:'*',
}))


app.use('/user', userRoutes);

app.use('/chats',chatsRoutes);

app.use('/groups', groupRoute);

User.hasMany(Message, { foreignKey: 'sender_id' });
Message.belongsTo(User, { foreignKey: 'sender_id' });

User.hasMany(Message, { foreignKey: 'receiver_id' });
Message.belongsTo(User, { foreignKey: 'receiver_id' });

User.belongsToMany(Group, { through: UserGroup, foreignKey: 'userId' });
Group.belongsToMany(User, { through: UserGroup, foreignKey: 'groupId' });

Group.hasMany(Message, { foreignKey: "groupId" });
Message.belongsTo(Group, { foreignKey: "groupId" });

sequelize.sync({alter: true}).then(()=>{
    console.log('Database Synced')
}).catch(err=>{
    console.log(err);
})

http.listen(3000,()=>{
    console.log("Server Started in Port: 3000")
})