
const path = require('path');



exports.signUpUser =  (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'views','signup', 'signup.html'));
}