import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
 // steps are:-
// get user details from user
// validate - not empty,email format
// check if user already exists:- by email
// check for images,avatar
// upload them to cloudinary
// remove password and refresh token token field from response
// create an user object
// check for user creation and return response

const registerUser= asyncHandler( async(req,res)=>{ // created method
    const {username,email,fullname,password}=req.body; //destructuring user data which we get from (form,json) using req.body
    console.log(username);

    if(
        [fullname,username,email,password].some((field)=>
            field?.trim() === "")
    ) {
        throw new ApiError(400,"All fields are required")
    }
    // instead of this all what we have done above we can also use if/else method for all fullname,username...

    if(User.find({username})){
        throw new ApiError(405,"User with this username already exist");
    }else if(User.find({email})){
        throw new ApiError(405,"User with this email already exist");
    }

    // now for images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"avatar file is required");
    }

    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken" 
    )

    if(!createdUser){
        throw new ApiError(500,"Error Occured while registering the user");
    }

    
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
    
})

export {registerUser};