import { User } from "../Model/User.Model.js";
import { ApiError } from "../Utils/ApiErrors.js";
import { asyncHandler } from "../Utils/Asynchandler.js";
import jwt from "json-web-token";

export const verifyJwt = asyncHandler(async(req,res,next)=>{
    
     const Token = req.cookies?.accessToken || req.header
      ("Authorization")?.replace("Bearer ","")  
    
      if(!Token){
    
        throw new ApiError(401,"unautharized request")
      }
    
      try {
       const decodedToken = jwt.verify(Token,process.env.ACCSSE_TOKEN_SCREATE)
      const user = await User.findById(decodedToken?._id)
      
      if(!user){
        throw new ApiError(401,"invalid Token")
      }

      req.user = user
       
      next();
      } catch (error) {
        
        throw new ApiError(401,'Invalid  access token')
      }


})