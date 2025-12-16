import { Router} from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/User.Controller.js";
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
export default router;