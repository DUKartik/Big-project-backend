import {Video} from "../models/video.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary,getPublicId,deleteOnCloudinary } from "../utils/cloudinary.js"

const publishVideo = asyncHandler(async (req,res)=>{
    let {title ,description} = req.body;
    title=title?.trim();
    description=description?.trim();

    if(!title || !description){
        throw new ApiError(400,"Either title or description is missing");
    }

    const videoLocalFilePath = req.files?.video?.[0].path;
    const ThumbnailLocalFilePath = req.files?.thumbnail?.[0].path;

    if(!videoLocalFilePath || !ThumbnailLocalFilePath){
        throw new ApiError(400,"All fields are required");
    }

    const videoFile=await uploadOnCloudinary(videoLocalFilePath);
    const Thumbnail=await uploadOnCloudinary(ThumbnailLocalFilePath);

    if(!videoFile || !Thumbnail){
        new ApiError(502,"Error Occured wile uploading video or thunbnail on cloudinary");
    }


    const video =await Video.create(
        {
            videoFile:videoFile?.url,
            thumbnail:Thumbnail?.url,            
            title,
            description,
            duration:videoFile.duration,
            owner:req.user,
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video published successfully")
    )
})

const getVideoById = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const video= await Video.findById(videoId);
    return res
    .status(200)
    .json(
        new ApiResponse(200,video)
    )
})

const getAllVideos =asyncHandler(async (req,res)=>{

})

const updateVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const thumbnailLocalPath = req.files?.path;
    let {title,description} = req.body || {};
    title=title?.trim();
    if(!title || !description || !thumbnailLocalPath){
        throw new ApiError(400,"atleast one of the fields are required")
    }

    let thumbnail;
    if(thumbnailLocalPath){
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    }
    if(thumbnailLocalPath && !thumbnail.url){
        throw new ApiError(406,"something went wrong while uploading it to a cloudinary");
    }


    const video=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                ...(title && {title}),
                ...(description && {description}),
                ...(thumbnail && {thumbnail:thumbnail.url})
            }
        },
        {new:true}
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video details has been updated sucessfully")
    )
})

export{
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo
}
