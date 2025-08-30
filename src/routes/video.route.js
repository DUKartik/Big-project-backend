import { Router } from "express";
import {
        publishVideo,
        getAllVideos,
        getVideoById,
        updateVideo,
        deleteVideo,
        togglePublishStatus
} from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =Router();

router.route("/getAllvideos").get(getAllVideos);

router.route("/uploadVideo").post(
    verifyJWT,
    upload.fields([
        {
            name:"video",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ])
    ,publishVideo);
router.route("/c/:videoId").get(getVideoById);
router.route("/c/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo);
router.route("/c/:videoId").delete(verifyJWT,deleteVideo);
router.route("/toggle/:videoId").patch(verifyJWT,togglePublishStatus);

export default router;