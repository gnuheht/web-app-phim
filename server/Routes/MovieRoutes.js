import  express  from "express";
import * as moviesController from "../Controller/MoviesController.js"
import {protect,admin} from "../middlewares/Auth.js"

const  router = express.Router();

//-----  PUBLIC ROUTES -----//
router.post("/import",moviesController.importMovies);
router.get("/",moviesController.getMovies);
router.get("/:id",moviesController.getMovieById);
router.get("/rate/top",moviesController.getTopRatedMovies);
router.get("/random/all",moviesController.getRandomMovies);

//-----  PRIVATE ROUTES -----//
router.post("/:id/reviews", protect,moviesController.createMovieReview);
router.delete("/:id/reviews", protect,moviesController.createMovieReview);
 

//-----  ADMIN ROUTES -----//
router.put("/:id", protect,admin,moviesController.updateMovie);
router.delete("/:id", protect,admin,moviesController.deleteMovie);
router.delete("/", protect,admin,moviesController.deleteAllMovie);
router.post("/",protect,admin,moviesController.createMovie);  
    


export default router;