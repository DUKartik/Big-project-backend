import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        commentedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        },
        message:{
            type:String,
            required:true,
        }
    },{timestamp:true}
)

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment",commentSchema);