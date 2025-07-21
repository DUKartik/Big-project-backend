import dotenv from 'dotenv';
import connectDB from "./db/DB.js"
import {app} from "./app.js"


dotenv.config({
    path: './.env'
})

/* *****************with importing DB (RECOMMENDED) *********** */

// Async function give promises that why we are able to use .then and catch


connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on Port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed ",error);
})











 









/*  ************************************** without importing ************** */

/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
const app =express();
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR:",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.log("ERROR :",error);
        
    }
})() */

