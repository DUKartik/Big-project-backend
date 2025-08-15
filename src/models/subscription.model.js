import mongoose from "mongoose";

const SubscriptionSchema= new mongoose.Schema(
    {
        subscriber:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },{timestamp:true});


export const Subscription = mongoose.model("Subscription",SubscriptionSchema);