const jwt = require('jsonwebtoken');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// const bcrypt = require('bcrypt');

const signToken = (id) => {
    return jwt.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.signup = catchAsync(async (req, res) => {
   const user={
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
    }

    //check if user exist already
    const ifUserExist = await User.findOne({where:{email:req.body.email}});
    if(ifUserExist){
        return res.status(400).json({
            status: "fail",
            message: "User Already Exist with that mail ID"
        })
    }
    const newUser = await User.create({user});

   console.log(newUser);

    const token = signToken(newUser.id, newUser.isPremium);

    res.status(201).json({
        status: "success",
        token,
        data: {
            newUser,
        }
    });
});

// exports.login = catchAsync(async (req, res, next) => {
//     const { email, password } = req.body;

//     // Check if email and password exist
//     if (!email || !password) {
//         return next(new AppError('Please provide email and password', 404));
//     }

//     // Check if user exists and if password is correct
//     const user = await User.findOne({ where: { email: email } });

//     if (!user) {
//         return next(new AppError('Incorrect email or password', 401));
//     }

//     const correct = await bcrypt.compare(password, user.password);

//     if (!correct) {
//         return next(new AppError('Incorrect email or password', 401));
//     }

//     // If everything is ok then send the jwt token to client
//     const token = signToken(user.id, user.isPremium);
//     res.status(200).json({
//         status: "success",
//         token
//     });
// });
