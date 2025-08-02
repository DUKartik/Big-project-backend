import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

 // steps for registerUser are:-
// get user details from user
// validate - not empty,email format
// check if user already exists:- by email
// check for images,avatar
// upload them to cloudinary
// remove password and refresh token token field from response
// create an user object
// check for user creation and return response

const generateAccessAndRefreshToken=async(userId)=>
{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};

    } catch (error) {
        throw new ApiError(508,"Error while generating Access and refresh token");
    }
}

const registerUser= asyncHandler( async(req,res)=>{ // created method
    let {username,email,fullName,password}=req.body; //destructuring user data which we get from (form,json) using req.body
    // console.log(username);

    username=username?.trim();
    fullName=fullName?.trim();
    email=email?.trim();
    password=password?.trim();

    if(
        [fullName,username,email,password].some((field)=>
            field === "")
    ) {
        throw new ApiError(400,"All fields are required")
    }
    // instead of this all what we have done above we can also use if/else method for all fullname,username...

    const UsernameAlreadyExist=await User.findOne({username});
    const emailAlreadyExist=await User.findOne({email});

    if(UsernameAlreadyExist){
        throw new ApiError(405,"User with this username already exist");
    }else if(emailAlreadyExist){
        throw new ApiError(405,"User with this email already exist");
    }

    // now for images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    let coverImage=null;
    if(coverImageLocalPath){
        coverImage=await uploadOnCloudinary(coverImageLocalPath);
    }
    if(!avatar){
        throw new ApiError(400,"avatar file is required");
    }

    const user=await User.create({
        fullName,
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

//steps for loginUser are:-
// get username/email and password
// validate that fields are not empty
// find username/email and check if exist match its password after bcrypt
// generate access token and refresh token
const loginUser=asyncHandler( async(req,res)=>{
    let {username,email,password}=req.body || {};

    username=username?.trim();
    email=email?.trim();
    password=password?.trim();

    
    if((!username ||!email) && !password){
        throw new ApiError(408,"All field are required");
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    });

    if(!user){
        throw new ApiError(404,"No account found with this email or username. Please sign up first.")
    }
    const isPasswordValid= await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(405,"Wrong password");
    }
    const {refreshToken,accessToken}=await generateAccessAndRefreshToken(user._id);
    // here in user object refreshtoken is blank ,but  refreshtoken updated on database

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    const option={
        httpOnly:true,
        secure:false // set it to true after creating frontend
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,{
            user:accessToken,refreshToken,loggedInUser// not save just for learning
        },"Loggedin Successfully")
    )
    
})

// steps for logout user are :-
// clear cookie and also clear access token from database
const logoutUser=asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const option={
        httpOnly:true,
        secure:false  //after creating frontend set it to true
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{},"user logged Out"))
})

const refreshAccessToken =asyncHandler(async(req,res)=>{
    const IncomingRefreshToken =req.cookies.refreshToken;

    if(!IncomingRefreshToken){
        throw new ApiError(401,"unauthorized request");
    }
    try {
            const decodedToken=jwt.verify(IncomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
            const user=await User.findById(decodedToken?._id);
        
            if(!user){
                throw new ApiError(401,"Invalid refreshToken")
            }
            
            if(user.refreshToken !== user?.refreshToken){
                throw new ApiError(401,"refresh Token is expired or used");
            }
            
            const {accessToken,newRefreshToken} =await generateAccessAndRefreshToken(user._id)
            const option ={
                httpOnly:true,
                secure:true
            }
            return res
            .status(200)
            .cookie("accessToken",newRefreshToken,option)
            .cookie("refreshToken",accessToken,option)
            .json(
                new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401);
    }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    let {oldPassword,newPassword,confirmPassword} = req.body;
    oldPassword=oldPassword?.trim;
    newPassword=newPassword?.trim;
    confirmPassword=confirmPassword?.trim;

    if((confirmPassword === newPassword)){
        throw new ApiError(400,"confirmPassword and newPassword should match");
    }

    const user=await User.findById(req.user?._id);

    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400,"Invalid Password");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password has been changed")
    )

})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    let {email,fullName} =req.body ||{};
    email=email?.trim();
    fullName=fullName?.trim();

    if(!fullName && !email){
        throw new ApiError(400,"either email or fullName is must required");
    }
    // const user=await User.findById(req.user?._id).select("-password");
    // if(!user){
    //     throw new ApiError(401,"Unauthorized Access Suspected");   this work is already done by middleware in auth.middleware.js
    // }                                                                just add auth middleware while defining route

    const user=req.user;  //and as we know auth middleware have done database search already and save it into req.user
    if(email){
        if(user.email === email){
            throw new ApiError(400,"You have entered the same email as before");
        }
        const userExist=await User.findOne({email});
        if(userExist){
            throw new ApiError(400,"Entered email already exist");
        }
        user.email=email;
    }
    if(fullName)user.fullName=fullName;
    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{user},"text details updated successfully"),
    )
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file missing");
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Something went wrong while uploading avatar on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{avatar:avatar.url},
        },
        {new:true}
    ).select("-password -refreshToken")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar Updated Successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"Avatar file missing");
    }

    const avatar =await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"Something went wrong while uploading coverImage on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{coverImage:coverImage.url},
        },
        {new:true}
    ).select("-password -refreshToken")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"coverImage Updated Successfully")
    )
})
export {
    registerUser,
    loginUser,
    updateUserAvatar,
    updateUserCoverImage,
    getCurrentUser,
    updateAccountDetails,
    changeCurrentPassword,
    refreshAccessToken,
    logoutUser
};