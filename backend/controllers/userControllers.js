const asyncHandler = require('express-async-handler');
const User = require("../models/userModel");
const generateToken = require('../utils/generateToken');


//@DESC Authenticate user/set token
//@ROUTE POST api/users/auth
//@ACCESS Public
const authUser = asyncHandler( async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(user && await user.matchPassword(password)){
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
        
    } else{
        res.status(401);
        throw new Error('Invalid email or password');
    };

    res.status(200).json({message: "authenticate user"})
});


//@DESC Register a user
//@ROUTE POST api/users
//@ACCESS Public
const registerUser = asyncHandler( async (req, res) => {
    // console.log(req.body);
    const {name, email, password} = req.body;

    const userExist = await User.findOne({email});

    if(userExist){
        res.status(400);
        throw new Error("User already exist");
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if(user){
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
        
    } else{
        res.status(400);
        throw new Error('Invalid user data')
    }

});


//@DESC Logout a user
//@ROUTE POST api/users/logout
//@ACCESS Public
const logoutUser = asyncHandler( async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({message: "User logged out"});
});


//@DESC Get user profile
//@ROUTE GET api/users/profile
//@ACCESS Private
const getUserProfile = asyncHandler( async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email
    };

    res.status(200).json(user);
});


//@DESC Update user profile
//@ROUTE PUT api/users/profile
//@ACCESS Private
const updateUserProfile = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id);

    if(user){
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if(req.body.password){
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        })
    }else{
        res.status(404);
        throw new Error('User not found')
    }

    res.status(200).json({message: "update user profile"})
});


module.exports = {authUser, registerUser, logoutUser, getUserProfile, updateUserProfile};