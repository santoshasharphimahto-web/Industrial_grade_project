import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';


const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN , 
    credentials:true,
}));
app.use(express.json({
    limit:"16kb" ,
}));
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}));
app.use(express.static("public"));
app.use(cookieParser());


//routers 
import  router  from './Routes/User.Router.js';
app.use('/api/v1/user',router)

//http://localhost:3000//api/v1/user/register

export default app