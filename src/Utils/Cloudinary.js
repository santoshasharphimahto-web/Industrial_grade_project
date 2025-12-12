import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECREATE ,// Click'View API Keys' above to copy your API secret
    });
    

    const uploadOnCloudinary =async (localFilePath)=>{
         if(!localFilePath) return null;
        try{
            const response= await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto",
             })                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
             //file has successfuly uploaded on the cloudinary!!!
             console.log('file has success fuly uploded on the cloudainary!!',response,response.url)
              return response;
        }
         catch(error){
       fs.unlink(localFilePath)//remove the locally file as the operation upload get failed from the locla sever 
       return null;

    }
}
export {uploadOnCloudinary  }





        
    // // Upload an image
    //  const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'shoes',
    //        }
    //    )