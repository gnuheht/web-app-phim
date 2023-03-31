import asyncHandler from "express-async-handler"
import User from "../Models/UserModel.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../middlewares/Auth.js";

// desc Register User
// @route POST/api/users/
// @access Publics

const registerUser = asyncHandler(async(req,res)=>{
    const{fullName,email,password,image} = req.body
    try {
        const userExists =await User.findOne({email});
        // check if user exists 
        if(userExists){
            res.status(400);
            throw new Error("User already exists")
        }
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        // create user in DB
        const user = await User.create({
            fullName,
            email,
            password :hashedPassword,
            image,
        });

        // if user created successfully send data and token to client
        if(user){
            res.status(201).json({
                _id : user._id,
                fullName: user.fullName,
                email : user.email,
                image : user.image,
                isAdmin : user.isAdmin,
                token : generateToken(user._id), 
            });
        } else{
            res.status(400);
            throw new Error("Invaild user data");
        }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// desc Login User
// @route POST/api/users/login
// @access Publics

const loginUser = asyncHandler(async(req,res)=>{
    const{ email,password } = req.body;
   try {
    // find user in db
    const user  = await User.findOne({email});
    // if user exists compare password with hashed password then send user data and token to client
    if(user && (await bcrypt.compare(password,user.password))){
        res.json({
            _id:user._id,
            fullName : user.fullName,
            email : user.email,
            image : user.image,
            isAdmin :user.isAdmin,
            token :generateToken(user._id),
        });
    }else{
        res.status(401);
        throw new Error("Invalid email or password")
    }
   } catch (error) {
    res.status(400).json({message:error.message});
   } 
});

////------ PRIVATE CONTROLLER -----////

// @desc Update user profile
// @Route PUT/api/user/profile
// @access Private

const updateUserProfile = asyncHandler(async(req,res)=>{
    const {fullName,email,image} = req.body;
    try {
        // find user in DB
        const user = await User.findById(req.user._id)
        // if user exists update user data and save it in DB
        if (user) {
            user.fullName = fullName || user.fullName;
            user.email = email || user.email;
            user.image = image || user.image;

            const updateUser = await user.save();
            //send updated user data and token to client
            res.json({
                _id : updateUser._id,
                fullName : updateUser.fullName,
                email : updateUser.email,
                image : updateUser.image,
                isAdmin : updateUser.isAdmin,
                token :generateToken(updateUser._id),
            });
        }
        // else send error message
        else{
           res.status(404);
           throw new Error("User not found");
        }
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

// desc Delete user profile
// @route Delete/api/user
// @access Private
const deleteUserProfile = asyncHandler(async(req,res)=>{
    try {
        // find user  in DB
        const user  = await User.findById(req.user._id);
        if(user){
            // if user is admin throw error message
            if(user.isAdmin) {
                res.status(400);
                throw new Error("Cant delete admin user");
            }
            // else delete user from DB 
            await user.deleteOne();
            res.json({ message :"User deleted successfully" });
        }
        // else send error message
        else{
            res.status(404);
            throw new Error("User not found");
        }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// @ desc Change user password
// @route PUT/ api/ users/password
// @access Private
const changUserPassword = asyncHandler(async(req,res)=>{
    const { oldPassword,newPassword} = req.body;
    try {
        //find user in DB
        const user = await User.findById(req.user._id);
        // if user exists compare old password with hash password then update user password and save it in db
        if (user && (await bcrypt.compare(oldPassword,user.password))){
            //hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword,salt);
            user.password = hashedPassword;
            await user.save();
            res.json({message:"Password changed successfully"})
        }
        else{
            res.status(401);
            throw new Error("Invaild old password");          
        }
    } catch (error) {
        res.status(400).json({message : error.message});
    }
});

// desc get all liked movies
// @route  GET/api/users/favorites
// @access Private
const getLikedMovies = asyncHandler(async(req,res)=>{
    try {
        // find user in DB
        const user = await User.findById(req.user._id).populate("likedMovies");
        if (user) {
            res.json(user.likedMovies);
        }
        else{
            res.status(404);
            throw new Error("User not Found");
        }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// desc Add movie to liked movies
// @route POST/api/users/favorites
// @access Private
const addLikedMovies = asyncHandler(async(req,res)=>{
   const {movieId} = req.body;
   try {
       // find user in DB
       const user = await User.findById(req.user._id);
       if(user){
        // check if movie already liked
        // if movie already liked send error message
        if(user.likedMovies.includes(movieId)){
            throw new Error("Movie already liked");
        }
        // else add movie to liked movies and save it in DB
        user.likedMovies.push(movieId);
        await user.save();
        res.json(user.likedMovies);
       }
       else{
         res.status(404);
         throw new Error("Movie not found");
       }
   } catch (error) {
    res.status(400).json({message : error.message});
   }
});

// @desc Delete all liked movies
// @ route DELETE/api/users/favorites
// @ access Private
const deleteLikedMovies = asyncHandler(async(req,res)=>{
    try{
        // find by user in DB
        const user = await User.findById(req.user._id);
        // if user exists delete all liked movies and save it in DB
        if (user) {
            user.likedMovies =[];
            await user.save();
            res.json({message:"Your movies liked has been deleted successfully"}); 
        } else {
            res.status(404);
            throw new Error("User not found")

        }
    } catch(error){
       res.status(400).json({ message: error.message});
    }
});


//// -------- ADMIN CONTROLLERS ---------- ///// 

// @desc  get all users
// @route GET/api/user
// @access Private/Admin

const getUsers = asyncHandler(async(req,res)=>{
    try{
        //find all user in DB
        const users = await User.find({});
        res.json(users);
    }
    catch (error){
        res.status(400).json({message:error.message});
    }
});

// desc Delete user
// @route DELETE/api/users/:id
// @access Private/Amin

const deleteUser = asyncHandler(async(req,res)=>{
    try {
        //find user in DB
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.isAdmin) {
                res.status(400);
                throw new Error("Cant delete admin user");
            }
            // else delete user from DB
            await user.deleteOne();
            res.json({message: "User deleted successfully"})
            // else send error message
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

export{ 
    registerUser, 
    loginUser, 
    updateUserProfile,
    deleteUserProfile,
    changUserPassword,
    getLikedMovies,
    addLikedMovies, // su dung fun nay sau khi tao model movie
    deleteLikedMovies,
    getUsers,
    deleteUser,
 };