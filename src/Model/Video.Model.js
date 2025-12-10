import mongoose,{Schema, Types} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
         videoFile:{
            type:String, //cloudnairy url
            required:true,
         },
         thumbnail:{
          type:String,//clouudnairy url
          required:true,

         },
         owner:{
            Types:mongoose.Schema.Types.ObjectId,
            ref:'User',
         },
         description:{
            type:String,
            require:true,

         },
         duration:{
            type:Number ,
            required:true,
         },
         views:{
            types:Number,
            default:0,
            
         },
         isPublished:{
          type:boolean,  
         }
    },
    {timestamps:true}
)
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video',videoSchema);