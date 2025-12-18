import { Router} from "express";
import { getCurrentUser, getUserChannelProfile, getUserWatchedHistory, loginUser, logoutUser, passwordChange, refreshUserToken, registerUser, updateAccountDetels, updateAvatarImage, updateCoverImage } from "../controllers/User.Controller.js";
import { upload } from "../Middlewares/Multer.Middleware.js";
import { User } from "../Model/User.Model.js";
import { verifyJwt } from "../Middlewares/Auth.Middleware.js";

                                                                                   

const router=Router();

router.route('/register').post(
    upload.fields(
        [
            {
              name:"avatar",    
              maxCount:1,
            },
            {
                name:"coverImage",
                maxCount:1,                                                                 
            }

        ]),
    
    registerUser
)
router.route("/login").post(loginUser)

// secure routes 

router.route("/logoutUser").post(verifyJwt,logoutUser)
router.route('/refreshUserToken').post(refreshUserToken)
router.route('/passwordChange').post(verifyJwt,passwordChange)
router.route("/getCurrentUser").get(verifyJwt,getCurrentUser)
router.route('/updateAccountDetels').patch(verifyJwt,updateAccountDetels)
router.route('/updateAvatarImage').patch(verifyJwt,upload.single("avatar"),updateAvatarImage)
router.route('/updateCoverImage').patch( verifyJwt,upload.single('coverImage'),updateCoverImage)

router.route('/c/:username').get(verifyJwt,getUserChannelProfile)
router.route('/getUserWatchedHistory').get(verifyJwt,getUserWatchedHistory)
export default router;