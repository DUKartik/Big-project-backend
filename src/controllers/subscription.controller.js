import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// firstly run auth middleware to chck whether the user is logined or not
// now get subscriber from req.user
//and channel from req.prams
const toggleSubscription = asyncHandler(async (req,res)=>{
    const {channelId} =req.params;
    const user = req.user;
    if(user._id==channelId){
        throw new ApiError("Sorry,but you can not subscribe your own channel");
    }
    
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel doesn't exist");
    }
    const Subscribed = await Subscription.findOne({channel:channel,subscriber:user});
    
    if(!Subscribed){
        const subscription =await Subscription.create({
            subscriber:user._id,
            channel: channel._id
        })
        return res
        .status(200)
        .json(
           new ApiResponse(200,subscription,"Channel Subscribed Successfully")
        )
    }
    const deleted=await Subscription.deleteOne({_id:Subscribed._id});
    return res
    .status(200)
    .json(
       new ApiResponse(200,deleted,"Unsubscribed Channel Successfully")
    )
})

const getUserChannelSubscribers = asyncHandler(async (req,res)=>{
    const {channelId} = req.params;
    const user =req.user;
    if(user._id!=channelId){
        throw new ApiError("UnAuthorized Access, Only Owner can Access this feature");
    }
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel Not found");
    }
    const subscriber = await Subscription.find({channel:channel._id}).select({subscriber:1});

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscriber,"Subscriber list fetched Successfully")
    )
})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const {subscriberId} =req.params;
    const user = req.user;
    if(user._id!=subscriberId){
        throw new ApiError("UnAuthorized Access, Only Owner can Access this feature");
    }
    const subscriber = await User.findById(subscriberId);
    if(!subscriber){
        throw new ApiError(404,"User not found");
    }
    const channels = await Subscription.find({subscriber:subscriber._id}).select({channel:1});

    return res
    .status(200)
    .json(
        new ApiResponse(200,channels,"channels data successfully fetched")
    )
})
export{
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}