
const path = require('path');



exports.signUpUser =  (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'views','signup', 'signup.html'));
}

exports.loginUser = (req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','signup','login.html'));
}