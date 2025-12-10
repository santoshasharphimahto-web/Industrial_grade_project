import  mongoose,{ Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'json-web-token';

const userSChema= new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true,
            trim:true,

        },
        
         email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,

        },
        fullName:{
            type:String,
            required:true,
            index:true,
             
        },
        avatar:{
            type:String, //url from coludnary 
            required:true,

        },
        coverImage:{
           type:String,//coludnary url
        },
        password:{
            type:String,
            required:[true,"password is required"],
        },
        refreshToken:{
            type:String,
        }

        
     
    },{timestamps:true}
)

userSChema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    this.password=bcrypt.hash(this.password,10);
    next()
})

userSChema.methods.isCorrectPassword= async  function(password){
  
    return await bcrypt.compare(password,this.password);
}

userSChema.methods.genreateAccessToken= function(){
  return  jwt.sign(
        {
          _id:this._id,  
          email:this.email,
          username:this.username,
          fullName:this.fullName,
        },
        process.env.ACCSSE_TOKEN_SCREATE,
        {
         expiresIn: process.env.ACCSSE_TOKEN_EXPIREY,   
        }

    )
}


userSChema.methods.genreateRefreshToken= function(){
  return  jwt.sign(
        {
          _id:this._id,  
          
        },
        process.env.REFRESH_TOKEN_SCREATE,
        {
         expiresIn: process.env.REFRESH_TOKEN_EXPIREY,   
        }

    )
}
export const User = mongoose.model("User",userSChema);