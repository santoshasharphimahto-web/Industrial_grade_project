import { asyncHandler } from "../Utils/Asynchandler.js";

import { ApiError } from "../Utils/ApiErrors.js";
import { User } from "../Model/User.Model.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import jwt from  "json-web-token";
import { Subscribtion } from "../Model/Subscribtion.model.js";
import mongoose, { Types } from "mongoose";


const genrateAccessAndRefreshToken = async(userId)=>{
  console.log(userId)
   try {
    const user = await User.findById(userId);
    const accessToken = user.genreateAccessToken();
    const refreshToken =  user.genreateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}
   } catch (error) {
      console.log("somthing went wrong while validating",error.message)
    throw new ApiError(500,"somthing wentWrong while genrating refesh and AcessToken")
    
   }
}

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
 // const coverImageLocalPath = req.files?.coverImage[0]?.path;
      let coveImageLocalPath;
      if(req.files && Array.isArray(req.files.coverImage)
         && req.files.coverImage.length>0){
        coveImageLocalPath=req.files.coverImage[0].path

      } // classic checking

    if(!avatarLocalPath){                                                                                                                                                                       
        throw new ApiError(400,"avatar field is required!!!")                                                                                                   
    }                                       

    const uplodedAvatar = await uploadOnCloudinary(avatarLocalPath);                            
     const uplodedCoverImage = await uploadOnCloudinary(coveImageLocalPath)

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
      const createdSearchUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!createdSearchUser){
        throw new ApiError(500,"somhing went wrong while registering!!")
      }

    return res.status(201).json(

        new ApiResponse (200,createdSearchUser,"user register successfully  ")
    )
    
})

const loginUser = asyncHandler(async(req,res)=>{
  
  //data-from the user
  //username||emainl and password validation
  //find the userexits in data base or note
  //password matching
  //refreshtoken ans accessToken genrtion 
  //send  cookise 


 const {email,username,password} = req.body
    //  console.log(email)

   if(!(username || email)){
       throw new ApiError(401," username or email are required")
   }
   
   const  user = await User.findOne({
    $or:[{username},{email}]
   })
  //  console.log(user)

   if(!user){

    throw new ApiError(404,"invalid Credentials ");
   }

    const isCorrectPassword = await user.isCorrectPassword(password);
    if(!isCorrectPassword){
      throw new ApiError(401,"password is incorrect !! ")
    }
   
     const {refreshToken,accessToken} = await genrateAccessAndRefreshToken(user._id)

     const loginUser = await User.findById(user._id).select("-password -refreshToken")

     var option={
      httpOnly:true,
      secure:true,
     }
     
     return res.status(200)
     .cookie("accessToken",accessToken,option)
     .cookie('refreshToken',refreshToken,option)
     .json(
      new ApiResponse(200,
        
        {
          
          user:loginUser, 
          refreshToken,
          accessToken 

      },
      "login successful"
       )
     )
  
})

const logoutUser  =  asyncHandler(async(req,res)=>{
    
   const logoutUser= await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
           refreshToken:undefined,
         } 
      },{
        new:true
      }

  )
  var option ={
  httpOnly:true,
  secure:true,
}

  return res.status(200)
.clearCookie("accessToken",option)
.clearCookie("refreshToken",option)
.json(
  new ApiResponse(200,logoutUser,"logoutSuccessFully!!")
)

})    

const refreshUserToken = asyncHandler(async(req,res)=>{

  //we nedd to identify user, need own the bases of refreshtoken
  //after that find the user
  //do comparigin incommingtoken vs storedtoken
  //genrate a new acessAndRefreshtoken
  //send cookie to the client browser 

  try {
    
    
  const incommingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken

  if(!incommingRefreshToken){
    throw new ApiError(401,"unathuarized request")

  }
 const decodedToken = jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SCREATE)

 const user = await User.findById(decodedToken?._id)
 console.log(user)

 if(!user){
  throw new  ApiError(401,"invalid Token or  expired or usedToken")

 }
 
 if(incommingRefreshToken !== user?.refreshToken){
    throw new ApiError( 401,"invalid refreshtoken")  

 }

  const {accessToken,refreshToken}= await genrateAccessAndRefreshToken(user._id)

 const option={
  httpOnly:true,
  secure:true,
 }

  return res.status(200)
 .cookie("accessToken",accessToken,option)
 .cookie("refreshToken",refreshToken,option)
 .json(
  
  new ApiResponse(200,{
    accessToken,
    refreshToken,
  },
  "refresh Token Successfully"
)

 )

    
  } catch (error) {

    // console.log("refresh token is invlaid",error?.message)
    throw new ApiError(401, error?.message||"invalid refreshtoken " )
    
  }



})

const passwordChange = asyncHandler(async(req,res)=>{
  
  //accepting password from the use 
  //checking the edge cases , impty,undaedfind 
  //find the user who want to change the password
  //doing compriegion old vs database stored password
  //saving the new password 
  //send  the response


 const {oldPassword,newPassword} = req.body

//  console.log(oldPassword,newPassword)
   
 if( (!oldPassword || !newPassword)){

  throw new ApiError(400,"missing field are required")
 }

  const user = await User.findById(req.user?._id)

const isCorrectPassword = await user.isCorrectPassword(oldPassword)

if(!isCorrectPassword){
  throw new ApiError(400,"password is incorrect")
}

user.password = newPassword
 await user.save({validateBeforeSave:false})

 return res.status(200)
 .json(
   new ApiResponse(200,user,"password changed sucessfully")
 )

})

const getCurrentUser = asyncHandler(async(req,res)=>{

  return res.status(200)
  .json(200,req.user,"current user fetched succesfully!!")
})

const updateAccountDetels = asyncHandler(async(req,res)=>{
//take detels that needto be change 
//check the connner case 
//find the user that, details need to be updated
//send the res to the client 

  const{ fullName,email} = req.body
  console.log(fullName,email)

  if(!fullName || !email){
    throw new ApiError(400, "all fields are required")
  }

   const user = await User.findByIdAndUpdate(

    req.user?._id,
    {
      $set:{
        fullName,
        email,
      }
    },
    {
      new:true,
    }
  ).select("-password -refreshToken")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"detelies update successfully")
  )

})

const updateAvatarImage = asyncHandler(async(req,res)=>{
 
  //receive the image from the multer
  //checks all the conner case 
  //upload the image on the cloudnary :- it will give the string
  //find the user udate the avatar path 

    const avatarLocalPath= req.file?.path
    console.log(avatarLocalPath)
    if(!avatarLocalPath){
      throw new  ApiError(400,"error while uploding the avatar")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // console.log(avatar)
     if(!avatar.url){
      throw new ApiError(500,"error whileuploding the avatar")
     }

     const user = await User.findByIdAndUpdate(
      req.user?._id,
      { 
        $set:{
          avatar:avatar?.url
        }
      },
      {
        new : true,
      }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
       new ApiResponse(200,user,"Avtar image update succesfully")
    )
})


const updateCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath= req.file?.path
    if(!coverImageLocalPath){
      throw new  ApiError(400,"error while uploding the coverImage")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     if(!coverImage.url){
      throw new ApiError(500,"error whileuploding the coverImage")
     }

     const user = await User.findByIdAndUpdate(
      req.user?._id,
      { 
        $set:{
          coverImage:coverImage?.url
        }
      },
      {
        new : true,
      }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
       new ApiResponse(200,user,"coverImage  update succesfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{

  const {username} = req.params  
  
  if(!username){
    throw new ApiResponse(404,"user has not found ")
  }

 const channel = await User.aggregate([

    {
      $match:{
        username:username?.toLowerCase(),
      }
    },
    
    {
       $lookup:{
        from:"subscribtions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      
       }
    },
    {
       $lookup:{
        from:"subscribtions",
        localField:"_id",
        foreignField:"subscribtion",
        as:"subscribedTo"
       }
    },
    {
      $addFields:{
        subscriberCounts:{
          $size:"$subscribers"
        },
        subscribersToCount:{
          $size:'$subscribedTo'
        },
        isSubscribed:{
          $cond:{
            if:{$in:[req.user?._id,"$subscribers.subscribtion"]},
            then:true,
            else:false,
          }
        }
      }
    },
    {
       $project:{
         email:1,
         username:1,
         coverImage:1,
         avatar:1,
         fullName:1,
         subscriberCounts:1,
         subscribersToCount:1,
         isSubscribed:1,
      
       }  
    }
  
 ])
 console.log(channel)

 return res.status(200)
 .json(
  new ApiResponse(200,channel[0],"userChannnelProfile details fetched successfully")
 )
 

})

const getUserWatchedHistory = asyncHandler(async(req,res)=>{

   const user = await User.aggregate ([

    {
      $match:{
       
        _id:new mongoose.Types.ObjectId(
          req.user?._id
        )

      }
    },
    {
         $lookup:{
          from:"videos",
          localField:"watchHistory",
          foreignField:"_id" ,
          as:"watchHistory",
          pipeline:[{

            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[

                {
                  $project:{
                    username:1,
                    email:1,
                    avatar:1,
                    fullName:1

                  }
                },
                {
                  $addFields:{
                    owner:{
                      $first:"$owner"
                    }
                  }
                }
              ]
            }
          }]
         }
    }
   ])
      
   return res
   .status(200)
   new ApiResponse(200,user[0].watchHistory,"user watchHistory fetched successfully")
})



export {
  registerUser,
  logoutUser,
  loginUser,
  refreshUserToken,
  passwordChange,
  getCurrentUser,
  updateCoverImage,
  updateAvatarImage,
  updateAccountDetels,
  getUserChannelProfile,
  getUserWatchedHistory,
  


};
