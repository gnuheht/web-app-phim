import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from "./config/db.js"
import userRoutes from "./Routes/UserRoutes.js";
import { errorHandler } from './middlewares/errorMiddlewares.js';
import movieRoutes from "./Routes/MovieRoutes.js";
import categoriesRoutes from "./Routes/CategoriesRoutes.js";
import Uploadrouter from './Controller/UploadFile.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//connect DB
connectDB();

//Main route//
app.get('/',(req,res)=>{
    res.send('API is running...');
});
//other route//
app.use("/api/users",userRoutes)
app.use("/api/movies",movieRoutes)
app.use("/api/categories",categoriesRoutes);
app.use("/api/upload",Uploadrouter);

// error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Sever running in http://localhost/${PORT}`);
});


