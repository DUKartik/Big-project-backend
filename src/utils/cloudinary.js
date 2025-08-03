import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs";


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

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
        fs.unlink(localFilePath); //remove locally saved file
        return null;
    }
}

const deleteOnCloudinary = async(cloudinaryUrl)=>{
    try {
        const parts = cloudinaryUrl.split("/");
        const filename = parts.slice(parts.indexOf("upload") + 2).join("/");
        const public_id =filename.replace(/\.[^/.]+$/, "");
        //above three lines use to extract puclic_id from url
        // ex url -> https://res.cloudinary.com/xyz/image/upload/v1754214043/abcd.jpg then, public_id->"/abcd"
        // all of things after upload/version and leave .abc 

        cloudinary.uploader.destroy(public_id);
        return response;
    } catch (error) {
        console.log("Something went wrong while deleting file on cloudinary");
        return null;
    }
}

export {uploadOnCloudinary,deleteOnCloudinary};