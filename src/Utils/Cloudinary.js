import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { existsSync } from "fs";

// Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
    });

    

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    console.log(
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET ? "SECRET_LOADED" : "SECRET_MISSING"
);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Cloudinary upload success:", response.secure_url);

    if (existsSync(localFilePath)) {
      await fs.unlink(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);

    if (existsSync(localFilePath)) {
      await fs.unlink(localFilePath);
    }

    throw error; // 🔥 VERY IMPORTANT
  }
};

export { uploadOnCloudinary };
