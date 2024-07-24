const Group = require('../models/group');
const User=require('./../models/user');
const UserGroup=require('./../models/userGroup');

exports.createGroup = async(req,res)=>{
    console.log(req.body);
    if(!req.user){
        return res.status(401).json({
            message: "unauthorised user"
        })
    }

    try{
        const group = await Group.create({
            name: req.body.name,
        })

       for(const id of req.body.users){
            await UserGroup.create(
               {
                groupId: group.id,
                userId: id
               }
            )
       }
       await UserGroup.create(
        {groupId: group.id,
         userId: req.user.id
        },
       
       )

        res.status(201).json({
            status: "success",
            group,
        })
    }catch(err){
        console.log(err);
    }
}


exports.getAllGroup = async(req,res)=>{
    try{
        var groupNameArray=[];
        console.log("In getgroup controller");
        const userId = req.user.id;
        const groups = await UserGroup.findAll({where:{userId: userId}});
        const groupIds = groups.map(group => group.dataValues.groupId);

        console.log(groupIds);
        for(var i=0;i<groupIds.length;i++){
            const group = await Group.findOne({where:{id:groupIds[i]}})
            groupName=group.dataValues.name;
            groupNameArray.push(groupName);
            console.log(groupNameArray)

        }

        res.status(200).json({
            status:"success",
            groupNameArray
        })
    }catch(err){

    }
}