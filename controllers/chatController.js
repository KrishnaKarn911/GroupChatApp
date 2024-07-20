const path=require('path');

exports.showChat = (req,res)=>{
    res.sendFile(path.join(__dirname,'..', 'views','signup', 'chatPage.html'))
}