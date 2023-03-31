import express  from 'express';
import multer from 'multer';
import path from 'path';
import storage from "../config/firebaseStorage.js";
import {v4 as uuidv4} from 'uuid'

const Uploadrouter = express.Router();

const upload = multer({
    storage : multer.memoryStorage(),
});

Uploadrouter.post("/",upload.single("file"),async(req,res)=>{
    try {
       // get file from request
       const file = req.file;
       // create new filename
       if (file) {
        const filename = `${uuidv4()}${path.extname(file.originalname)}`;

        const blob = storage.file(filename);
        const blobStream = blob.createWriteStream({
            resumable :false,
            metadata :{
                contentType :file.mimetype,
            },
        });
        // if error
        blobStream.on("error",(error)=>{
            res.status(400).json({message:error.message})
        });
        // if sucess
        blobStream.on("finish",()=>{
            // get the public URL
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${filename}?alt=media`;
            // return the file name and its public URL
            res.status(200).json(publicUrl);
        });
        blobStream.end(file.buffer);
        // when there no file 
       } else {
        res.status(400).json({message:"PLease upload a file"});
       }     
    } catch (error) {
        res.status(400).json({message : error.message});
    }
});

export default Uploadrouter;