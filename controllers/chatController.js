const path=require('path');
const Message=require('./../models/messages');
const User=require('./../models/user');

exports.showChat = (req,res)=>{
    res.sendFile(path.join(__dirname,'..', 'views','signup', 'chatPage.html'))
}

exports.sendMessage=async(req,res)=>{
   
    try{
        const message = await Message.create({
            message: req.body.message,
            userName: req.user.name,
            userId: req.user.id
        })
        console.log(message);
        res.status(201).json({
            status: "success",
            message
        })
    }catch(err){
        console.log(err)
    }

}

exports.getMessage = async(req,res)=>{
    try{
        console.log(req.user);
        const user=await User.findOne({where:{id: req.user.id}});
        if(!user){
            return res.status(401).json({
                status: fail,
                message: "Unauthorised User"
            })
        }
        const messages = await Message.findAll();
        console.log(messages);
        res.status(200).json({
            status: "success",
            messages
        })
    }catch(err){
        console.log(err);
    }

}