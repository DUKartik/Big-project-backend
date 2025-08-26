import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// firstly run auth middleware to chck whether the user is logined or not
// now get subscriber from req.user
//and channel from req.prams
const subscribeChannel = asyncHandler( async(req,res)=>{
    const subscriber =req.user;
    const subscription = await Subscription.create({
        channel,
        subscriber
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscription,"subscribed channel successfully"))
})

export{
    subscribeChannel
}