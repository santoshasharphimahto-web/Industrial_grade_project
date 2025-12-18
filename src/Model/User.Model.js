import  mongoose,{ Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema= new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true,
            trim:true,

        },
        watchHistory:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }],
        
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

userSchema.pre('save', async function(next){
    if(!this.isModified('password'))  return;
     this.password= await bcrypt.hash(this.password,10);
    
    
})

userSchema.methods.isCorrectPassword= async function(password){
  
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.genreateAccessToken= function(){
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


userSchema.methods.genreateRefreshToken= function(){
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
export const User = mongoose.model("User",userSchema);