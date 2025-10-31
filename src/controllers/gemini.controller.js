import { getResponse } from "../utils/gemini.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const GetContentIdea = asyncHandler(async (req,res)=>{
    let {IdeaDetail} = req.body;
    if(!IdeaDetail){
        throw new ApiError(404,"Please Enter your idea detail");
    }
    IdeaDetail+="\nin short bulletpoints max upto 4 lines"
    const response = await getResponse(IdeaDetail);
    if (!response) {
        throw new ApiError(502,"Something went wrong while requesting response from gemini");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,response.text,"response got successfully fetched from gemini")
    )
})

export {GetContentIdea}