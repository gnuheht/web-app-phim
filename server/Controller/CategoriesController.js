import asyncHandler from "express-async-handler";
import Categories from "../Models/CategoriesModel.js";

//--------- PUBLIC CONTROLLERS --------
// @desc get all catergories
// @route GET/API/catergories
// @access Public

const getCategories = asyncHandler(async(req,res)=>{
    try {
        // find all categories in database
        const categories = await Categories.find({})
        // send all categories to the client
        res.json(categories);
    } catch (error) {
        res.status(400).json({message : error.message});
    }
});

//---------- ADMIN CONTROLLER---------

// @desc create new category
//  @route POST/api/categories
// @ access Private/Admin

const createCategory = asyncHandler(async(req,res)=>{
    try {
        // get title from request body
        const { title } = req.body;
        // create new category
        const category = new Categories({
            title,
        });
        //save the category in database
        const createdCategory = await category.save();
        // send new category to the client
        res.status(400).json(createdCategory);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// @desc update category
// @route PUT/api/categories/:id
// @ access Private/Admin

const updateCategory = asyncHandler(async(req,res)=>{
    try {
        // get category id from request params      
        const category = await Categories .findById(req.params.id);
        if (category) {
            // update category title
            category.title = req.body.title || category.title;
            //save the updated category in database
            const updatedCategory = await category.save();
            //send the updated category to the client
            res.json(updatedCategory);
        } else {
            res.status(400).json({message :"Category not found"});
        }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// @desc delete category
// @route DELETE/api/categories/:id
// @access Private/admin

const deleteCategory = asyncHandler(async(req,res)=>{
    try {
        // get category id from request params
        const category = await Categories.findById(req.params.id);
        if (category) {
            // delete the category from database
            await category.deleteOne();
            // send success message to the client
            res.json({message:"Removed succsessfully"})
        } else {
            res.status(404).json({message:"Category not found"});
        }
    } catch (error) {
        res.status(400).json({message : error.message});
    }
});

export {getCategories,createCategory,updateCategory,deleteCategory};