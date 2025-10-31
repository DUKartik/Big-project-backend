import { Router } from "express";
import { 
    getCurrentUser,
    getWatchHistory,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    refreshAccessToken,
    loginUser,
    logoutUser,
    registerUser, 
    getUserChannelProfile} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT,optionalAuth } from "../middlewares/auth.middleware.js";

const router =Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser);

//secured route
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").post(verifyJWT,getCurrentUser);

router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);

router.route("/c/profile").get(optionalAuth,getUserChannelProfile);
router.route("/watch-history").get(verifyJWT,getWatchHistory);

export default router;