import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());

app.use(express.json({limit:"16kb",}));
app.use(express.urlencoded({limit:"16kb"}));
app.use(express.static("public")); // whichh could be acess by anyone
app.use(cookieParser()); // use to store read cookie on user browser

//routes import
import userRouter from './routes/user.route.js'
import videoRouter from './routes/video.route.js'

//routes declaration

app.get('/', (req, res) => {
  res.send('🚀 API is up and running!');
});


app.use("/api/v1/users",userRouter); // in previous projects we were using the routes directly here
// but now, we are sending it to user.routes.js to handle this request app.use("/webpagename",routeFileVariable)                          
// the webpage url will be http://xyz.com/users -> now we are at user.route.js file
// for signup ,let say http://xyz.com/users/signup -> similarly we can make it for login also
// for login , http://xyz.com/users/login -> Basically we are using two routes for signup or login
// but industry level practice is http://xyz.com/api/version/users/...

app.use("/api/v1/videos",videoRouter);
export {app};