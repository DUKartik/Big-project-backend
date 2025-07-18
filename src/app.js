import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());

app.use(express.json({limit:"16kb",}));
app.use(express.urlencoded({limit:"16kb"}));
app.use(express.static("public")); // whichh could be acess by anyone
app.use(cookieParser()); // use to store read cookie on user browser



export {app};