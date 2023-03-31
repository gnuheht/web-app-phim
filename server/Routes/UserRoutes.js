import express from "express";
import { addLikedMovies, 
    changUserPassword, 
    deleteLikedMovies, 
    deleteUser, 
    deleteUserProfile, 
    getLikedMovies, 
    getUsers, 
    loginUser, 
    registerUser, 
    updateUserProfile } from "../Controller/UserController.js";
import {protect , admin} from "../middlewares/Auth.js"

const router = express.Router();

//----- PUBLIC ROUTES ------
router.post("/",registerUser);
router.post("/login",loginUser);

//----- PRIVATE ROUTES ------
router.put("/", protect, updateUserProfile);
router.delete("/",protect, deleteUserProfile);
router.put("/password",protect,changUserPassword);
router.get("/favorites",protect,getLikedMovies);
router.post("/favorites",protect,addLikedMovies);
router.delete("/favorites",protect,deleteLikedMovies);

//------ADMIN ROUTES------
router.get("/",protect,admin,getUsers);
router.delete("/:id",protect,admin,deleteUser);

export default router; 