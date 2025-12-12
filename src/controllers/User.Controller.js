import { asyncHandler } from "../Utils/Asynchandler.js";

import { ApiError } from "../Utils/ApiErrors.js";
import { User } from "../Model/User.Model.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

const registerUser  = asyncHandler( async (req,res)=>{

    //get user details from the frontend
    //vailidate it - not empty
    //check useralready exits -- emal and usename 
    //check for image --avavtar
    //upload them to cloudnary,avtar
    //create a user object -entry in db
    //remove the pasword and refresh token filed from the response
    //check for the user creation
    //return res

    const {email,username,fullName,password}=req.body
                                                      
    if(
        [email,username,fullName,password].some((fields)=>fields?.trim()==="")
    ){

        throw new ApiError(400,"all fields are required!!!!")
    }
   const createdUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(createdUser){
        throw new ApiError(409, "User with email or Usernamealready exits!!!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar field is required!!!")
    }

    uplodedAvatar = await uploadOnCloudinary(avatarLocalPath);
    uplodedCoverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!uplodedAvatar){

        throw new ApiError(400,"please reatmpt again")
    }

   const user = await User.create({

        username:username.toLowerCase(),
        email,
        fullName,
        avatar:  uplodedAvatar.url,
        coverImage: uplodedCoverImage?.url || "",
        password
        
    })
      const created= await user.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!created){
        throw new ApiError(500,"somhing went wrong while from our side while registering!!")
      }

    return res.staus(201).json(

        new ApiResponse (200,createdUser,"user register successfully  ")
    )

})

export {registerUser};
