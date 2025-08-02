import { Router } from "express";
import { 
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    refreshAccessToken,
    loginUser,
    logoutUser,
    registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/update-account").post(verifyJWT,updateAccountDetails);
router.route("/update-avatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/update-cover-image").post(verifyJWT,upload.single("coverImage"),updateUserCoverImage);

export default router;