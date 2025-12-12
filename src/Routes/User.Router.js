import { Router} from "express";
import { registerUser } from "../controllers/User.Controller.js";
import { upload } from "../Middlewares/Multer.Middleware.js";
import { User } from "../Model/User.Model.js";
                                                                                   

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

export default router;