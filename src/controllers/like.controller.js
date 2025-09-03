import {Like} from "../models/like.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const user = req.user;

    const isLiked = await Like.findOne({video:videoId,likedBy:user._id}); 
    
    if(!isLiked){
        const like = await Like.create(
            {
                likedBy:user._id,
                video: videoId,
            }
        )
        return res
        .status(200)
        .json(
            new ApiResponse(200,like,"Video linked successfully")
        )
    }

    await Like.deleteOne(isLiked);
    return res
    .status(200)
    .json(
        new ApiResponse(200,isLiked,"like removed from video")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const user =req.user;
    const isCommentLiked = await Like.findOne({likedBy:user._id,comment:commentId});
    if(!isCommentLiked){
        const likeComment = await Like.create(
            {
                likedBy:user._id,
                comment:commentId
            }
        )
        return res
        .status(200)
        .json(
            new ApiResponse(200,likeComment,"comment liked successfully")
        )
    }

    await Like.deleteOne(isCommentLiked);
    return res
    .status(200)
    .json(
        new ApiResponse(200,isCommentLiked,"Like removed from comment")
    )

})


const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregatePaginate([
        {
            $match:{
                likedBy:req.user._id
            }
        },
        {
            $project:{
                video:1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,likedVideos,"Liked Videos fetched successfully")
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    getLikedVideos
}