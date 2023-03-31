
import { MoviesData } from "../Data/MoviesData.js";
import Movie from "../Models/MoviesModel.js";
import asyncHandler from "express-async-handler"; 


// -------- PUBLIC CONTROLLER --------//
// @desc import movies
// @route POST/api/movies/import
// @access Public

const importMovies = asyncHandler (async(req,res)=>{

    // first we make sure our Movies table is empty by delete all documment
      await Movie.deleteMany({});
      // then we insert all movies from MoviesData
      const movies = await Movie.insertMany(MoviesData);
      res.status(201).json(movies);
});

// @desc  get all movies
// @route GET/api/movies
// @access Public

const getMovies = asyncHandler(async(req,res)=>{
    try {
        // filter movies by category,time,language,rate,year and search
        const { category,time,language,rate,year,search} = req.query;
        let query ={
            ...( category && {category}),
            ...( time && {time}),
            ...( language && {language}),
            ...( rate && {rate}),
            ...( year && {year}),
            ...( search && {name : {$regex : search,$options:"i"}}),
        }

        //load more movies functionality
        const page = Number(req.query.pageNumber) || 1 ; // if pageNumber provided in query we set it to
        const limit = 2 ; // 2 movies per page
        const skip = (page-1)*limit; // skip 2 movies per page

        // find movies by query ,skip and limit
        const movies = await Movie.find(query)
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit);

        // get total number of movies
        const count = await Movie.countDocuments(query);

        // send response with movies and total number of movies
        res.json({movies, 
            page, 
            pages :Math.ceil(count/limit), // total number of pages
            totalMovies : count}); // total number of movies
    } catch (error) {
        res.status(400).json({message : error.message});
    } 
});

// @desc get movie by id
// @route GET/api/movies/id
// @access Public

const getMovieById = asyncHandler(async(req,res)=>{
      try {
        // find movie by id in database
        const movie  = await Movie.findById(req.params.id);
        // if the movie found send it to client
        if(movie){
            res.json(movie);
        }
        else{
            res.status(400);
            throw new Error("Movies not found");
        }
      } catch (error) {
        res.status(400).json({message: error.message});
      }
});

// @desc Get top rated movies
// @route GET/API/movies/rated/top
// @ access Public

const getTopRatedMovies = asyncHandler(async(req,res)=>{
    try {
        //find top rated movies
        const movies = await Movie.find({}).sort({ rate:-1 });
        //send top rated movies to the client
        res.json(movies);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// @desc Get Random movies
// @ route GET?/api/movies/random/all
// @ access Public

const getRandomMovies = asyncHandler(async(req,res)=>{
    try {
        //find random movies
        const movies = await Movie.aggregate([{ $sample:{size : 8}}]); 
        // send random movies to the client
        res.json(movies);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});


//----------- PRIVATE CONTROLLER--------//

// @desc Create movie review
// @route POST/api/movies/:id/reviews
// @access Private

const createMovieReview =  asyncHandler(async(req,res)=>{ 
    const { rating , comment  } = req.body; 
    try {
        // find movie by id in database
        const movie = await Movie.findById(req.params.id);
          
        if (movie) {
            // check if user already reviewed this movie
            const alreadyReviewd = movie.reviews.find(
                (r) => r.userId.toString() === req.user._id.toString()
            );
            // if the user already reviewed this movie
            if(alreadyReviewd){
                res.status(400);
                throw new Error(" You already reviewed this movie");
            }
            //else create a new review
            const review ={
                userName: req.user.fullName,
                userId : req.user._id,
                userImage : req.user.image,
                rating : Number(rating),
                comment,
            }
            //push the new reviews to reviews array
            movie.reviews.push(review);
            // increment the  number of reviews
            movie.numberOfReviews = movie.reviews.length;
            //calculate the new rate
            movie.rate = movie.reviews.reduce((acc,item)=>item.rating+acc,0) /
            movie.reviews.length;
            // save the movie in database
            await movie.save();
            // send the new movie to the client
            res.status(201).json({
                message : "Review added",
            });
        }else{
            res.status(404);
            throw new Error("Movie not found");
        }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// ---------- ADMIN CONTROLLER ----------//
// @desc Update movie
// @route PUT/api/movies/:id
// @access Private/Admin    
const updateMovie = asyncHandler(async(req,res)=>{
    try {
        // get data form request body
        const {
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts
        } = req.body;

         // find movie in database

         const movie = await Movie.findById(req.params.id);
              
         if (movie) {
            //  update movie data
            movie.name = name || movie.name;
            movie.desc = desc || movie.desc;
            movie.image = image || movie.image;
            movie.titleImage = titleImage || movie.titleImage;
            movie.rate = rate || movie.rate;
            movie.numberOfReviews = numberOfReviews || movie.numberOfReviews;
            movie.category = category || movie.category;
            movie.time = time || movie.time;
            movie.language = language || movie.language;
            movie.year = year || movie.year;
            movie.video = video || movie.video;
            movie.casts = casts || movie.casts
         // save the movie in database

         const updateMovie = await movie.save();

         //send the updated movied to the client
         res.status(201).json(updateMovie);

         }
         else{
            res.status(400)
            throw new Error("Movie not found");
         }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// @desc Delete movie
// @route DELETE/api/movies/:id
// @access Private/Admin

const deleteMovie = asyncHandler(async(req,res)=>{
    try {
        // find movie by id in database
        const movie = await Movie.findById(req.params.id);
        // if this movie is found send 404 error
        if (movie) {
            await movie.deleteOne();
            res.json({message:"Movie has been deleted"});
            //if the movie is not found send 404 error
        } else {
            res.status(400)
            throw new Error("Movie not found");
        }
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

// @desc Delete all movies
// @ route DELETE/api/movies
// @ access Private/Admin

const deleteAllMovie = asyncHandler(async(req,res)=>{
     try {
        // delete all movies
        await Movie.deleteMany({});
        res.json({message:"All movie removed"});
     } catch (error) {
        res.status(400).json({message:error.message});
     }
});

// @ desc create movie
// @ route POST/api/movies
// @ access Private/Admin

const createMovie = asyncHandler(async(req,res)=>{
    try {
        // get data form request body
        const {
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts
        } = req.body;
                 
         // create a new movie
         const movie = new Movie({
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts,
            userId:req.user._id,
         });
        // save the movie in database
        if (movie) {
            const createdMovie = await movie.save();
            res.status(201).json(createdMovie);
        }else{
          res.status(400);
          throw new Error("Invalid movie data");  
        }
         }           
     catch (error) {
        res.status(400).json({message:error.message});
    }
});

export{ importMovies,
     getMovies,
     getMovieById,
     getTopRatedMovies,
     getRandomMovies,
     createMovieReview,
    updateMovie,
    deleteMovie,
    deleteAllMovie,
    createMovie
};