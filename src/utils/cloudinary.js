import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs";
import { ApiError } from './ApiError.js';
import { log } from 'console';
import { PassThrough } from 'stream';


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const getPublicId = (cloudinaryUrl)=>{
    let cleanUrl=cloudinaryUrl.split("?")[0];

    let parts = cleanUrl.split("/upload/");
    if(parts.length<2)return null;
    let publicIdWithExt = parts[1]; // everything after /upload/
    let publicIdWithoutVersion = publicIdWithExt.replace(/^v[0-9]+\//, ""); // remove version prefix
    let publicId = publicIdWithoutVersion.replace(/\.[^/.]+$/, ""); // remove file extension

    return publicId; // e.g. "folder/avatar_abc"
}

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath)return null;
        const response= await cloudinary.uploader.upload
        (localFilePath,{
            resource_type: "auto",
        })
        // console.log("file has been uploaded on cloudinary ",response.url);
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch{
        fs.unlinkSync(localFilePath); //remove locally saved file
        return null;
    }
}

const deleteOnCloudinary = async (cloudinaryUrl, resourceType = "image") => {
  try {
    const public_id = getPublicId(cloudinaryUrl);
    if (!public_id) throw new ApiError(500, "Invalid Cloudinary URL");

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType, // must match what was used in upload
    });

    console.log("Cloudinary delete result:", result);
    return result;
  } catch {
    return null;
  }
};

export {uploadOnCloudinary,deleteOnCloudinary,getPublicId};