import {Video} from "../models/video.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary,getPublicId,deleteOnCloudinary } from "../utils/cloudinary.js"
import { parse } from "dotenv"

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
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pageNum = parseInt(page,10) || 1;
    const limitNum = parseInt(limit,10) || 10;
    const skip = (pageNum-1)*limitNum;

    let filter = {}; 
    if (query) filter.title = { $regex: query, $options: 'i' };
    if (userId) filter.userId = userId;

    let sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === 'asc' ? 1 : -1;
    } else {
        sort = { uploadDate: -1 };
    }

    const videos =await Video.aggregatePaginate([
        {$match:filter},
        {$sort:sort},
        {$skip:skip},
        {$project:{
                title:1,
                views:1,
                Owner:1,
                videoFile:1,
                thumbnail:1,
                duration:1,
                isPublished:1
            }
        }
    ])

    const totalDocs = await Video.countDocuments(filter);

    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            page: pageNum,
            limit: limitNum,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limitNum),
            videos
        })
    )
})

const updateVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const thumbnailLocalPath = req.files?.path;
    let {title,description} = req.body || {};
    title=title?.trim();
    if(!title && !description && !thumbnailLocalPath){
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

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found in the database");
    }
    const cloudinaryVideoLink = video?.videoFile;
    if(cloudinaryVideoLink){
        const publicId = await getPublicId(cloudinaryVideoLink);
        await deleteOnCloudinary(publicId);
    }
    await video.deleteOne();
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findByIdAndUpdate(
        videoId,
        [
            {
                $set:{
                    isPublished:{$not:"$isPublished"}
                }
            }
        ],
        {new:true}
    );
    if(!video){
        throw new ApiError(404,"video not found")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Publish status has been Successfully changed")
    )
})

export{
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
