const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
require('dotenv').config({ path: 'config.env' });
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Initialize S3 client with AWS SDK v3
const s3 = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ACCESS_KEY_PASSWORD
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKET,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + path.extname(file.originalname)); // Use timestamp as filename
        }
    })
});



const userRoutes = require('./Routes/userRoutes');
const chatsRoutes = require('./Routes/chatRoute');
const groupRoute = require('./Routes/groupRoute');

const User = require('./models/user');
const Message = require('./models/messages');
const Group = require('./models/group');
const UserGroup = require('./models/userGroup');
const GroupAdmin = require('./models/groupAdmin');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: '*' }));

app.use('/user', userRoutes);
app.use('/chats', chatsRoutes);
app.use('/groups', groupRoute);

app.post('/upload', upload.single('file'), (req, res) => {
    res.status(200).json({ fileUrl: req.file.location });
});


User.hasMany(Message, { foreignKey: 'sender_id' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });

User.hasMany(Message, { foreignKey: 'receiver_id' });
Message.belongsTo(User, { foreignKey: 'receiver_id' });

User.belongsToMany(Group, { through: UserGroup, foreignKey: 'userId' });
Group.belongsToMany(User, { through: UserGroup, foreignKey: 'groupId' });

User.belongsToMany(Group, { through: GroupAdmin, foreignKey: 'adminId' });
Group.belongsToMany(User, { through: GroupAdmin, foreignKey: 'groupId' });

Group.hasMany(Message, { foreignKey: 'groupId' });
Message.belongsTo(Group, { foreignKey: 'groupId' });

sequelize.sync().then(() => {
    console.log('Database Synced');
}).catch(err => {
    console.log(err);
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room (user or group)
    socket.on('join-room', ({ userId, group }) => {
        if (userId) {
            socket.join(`user-${userId}`);
        }
        if (group) {
            socket.join(`group-${group}`);
        }
    });

    // Handle sending messages to users or groups
    socket.on('send-message', ({ message, userId, group,username }) => {
        if (userId) {
            console.log(message);
            socket.to(`user-${userId}`).emit('receive-message', { message, from: socket.id });
        }
        if (group) {
            console.log(username);
            socket.to(`group-${group}`).emit('receive-message', { message, from: username });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Listen on the server instance, not the http module
server.listen(3000, () => {
    console.log("Server Started on Port: 3000");
});


