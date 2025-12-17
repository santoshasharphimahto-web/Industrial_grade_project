import { asyncHandler } from "../Utils/Asynchandler.js";

import { ApiError } from "../Utils/ApiErrors.js";
import { User } from "../Model/User.Model.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import jwt from  "json-web-token";


const genrateAccessAndRefreshToken = async(userId)=>{

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


 const {email,username,password}=req.body

   if(!(username || email)){
       throw new ApiError(401," username or email are required")
   }
   
   const  user = await User.find({
    $or:[{username},{email}]
   })

   if(!user){

    throw new ApiError(404,"invalid Credentials ");
   }

    const isCorrectPassword = await user.isCorrectPassword(password);
    if(!isCorrectPassword){
      throw new ApiError(401,"password is correct !! ")
    }
   
     const {refreshToken,accessToken} = await genrateAccessAndRefreshToken(user._id)

     const loginUser = await User.findById(user._id).select("-password -refreshToken")

     var option={
      httpOnly:true,
      secure:true,
     }
     
     res.status(200)
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

const logoutUser =  asyncHandler(async(req,res)=>{
    
   await User.findByIdAndUpdate(
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

res.status(200)
.clearCookie("accessToken",option)
.clearCookie("refreshToken",option)
.json(
  new ApiResponse(200,{},"logoutSuccessFully!!")
)

})

const refreshUserToken = asyncHandler(async(req,res)=>{

  //we nedd to identify user, need own the bases of refreshtoken
  //after that find the user
  //do comparigin incommingtoken vs storedtoken
  //genrate a new acessAndRefreshtoken
  //send cookie to the client browser 

  const incommingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken

  if(!incommingRefreshToken){
    throw new ApiError(401,"unathuarized request")

  }
  try {
    
 const decodedToken = jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SCREATE)

 const user = await User.findById(decodedToken?._id)

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

 res.status(200)
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

    console.log("refresh token is invlaid",error?.message)
    throw new ApiError(401, error?.message||"invalid refreshtoken " )
    
  }



})





export {
  registerUser,
  logoutUser,
  loginUser,
  refreshUserToken,


};
