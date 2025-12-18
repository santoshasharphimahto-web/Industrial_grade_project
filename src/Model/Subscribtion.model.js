import mongoose,{Schema} from "mongoose";

const subscribtionSchema = new Schema(
    {
    subscribtion:{
        type:mongoose.Schema.Types.ObjectId, //one who is
        // subscribing 
        ref:"User",

    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,//one to them subscriber is 
        // subscribing
        ref:"User",
    }
    },
    {timestamps:true}
)

export const Subscribtion = mongoose.model("Subscribtion",subscribtionSchema)