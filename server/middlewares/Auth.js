import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js";
import asyncHandler from "express-async-handler";
// @desc Authenticated user & get token

const generateToken =(id)=>{
    return jwt.sign({ id },process.env.JWT_SERCET, {
        expiresIn : "1d",
    });
};

// protection middlwares
const protect = asyncHandler(async(req, res, next)=>{
    let token;
    //  check if token exists in the headers
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
        ) {
            // set token from Bearer token in header
            try {
                token = req.headers.authorization.split(" ")[1];
                // vertify token and get user id
                const decoded = jwt.verify(token, process.env.JWT_SERCET);
                // get user id from decoded token
                req.user = await User.findById(decoded.id).select("-password");
                next(); 
            } catch (error) {
                console.error(error);
                res.status(401);
                throw new Error("Not authorized,token failed");
            }
    }
    if (!token) {
        res.status(401);
        throw new Error("Not authorized,no token"); 
    }
});

// admin middlwares
const admin = (req, res, next )=>{
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error("Not authorized as an admin");
    }
};
export {generateToken,protect,admin};