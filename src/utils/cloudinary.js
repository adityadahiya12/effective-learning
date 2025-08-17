import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        const result = await cloudinary.uploader.upload(localFilePath,{resource_type: "auto"})
        // file 
        console.log("File uploaded successfully:", result);
        response.url;
        return response;
        
    } catch (error) {
        console.error("Error uploading image:", response.url);
        throw error;
    }
}

cloudinary.v2.uploader.upload("path/to/image.jpg", (error, result) => {
    if (error) {
        console.error("Error uploading image:", error);
    } else {
        console.log("Image uploaded successfully:", result);
    }
});