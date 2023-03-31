import  express  from "express";
import * as categoriesController from "../Controller/CategoriesController.js"; 
import {protect,admin} from "../middlewares/Auth.js"

const  router = express.Router();

//--------- PUBLIC CONTROLLER --------//
router.get("/",categoriesController.getCategories);

//--------- ADMIN CONTROLLER--------//

router.post("/",protect,admin,categoriesController.createCategory);
router.put("/:id",protect,admin,categoriesController.updateCategory);
router.delete("/:id",protect,admin,categoriesController.deleteCategory);


export default router;