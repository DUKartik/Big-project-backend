import { Router } from "express";
import {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =Router();

router.route("/toggle/:channelId").post(verifyJWT,toggleSubscription);
router.route("/Channel/:subscriberId").get(verifyJWT,getSubscribedChannels);
router.route("/Subscriber/:channelId").get(verifyJWT,getUserChannelSubscribers);

export default router;