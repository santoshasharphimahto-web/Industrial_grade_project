import mongoose from "mongoose";

import {DB_NAME} from "../constent.js";

const DbConnection= async()=>{

    try{ 

      const ConnectionInstance= await mongoose.connect(`${ process.env.MONGODB_URI}/${DB_NAME}`)
      //  console.log(ConnectionInstance);
       console.log(`\n Connection establised successfully ::DB host!! ${ConnectionInstance.connection.host}`);


    }catch(error){
    console.log("MONOGODB connection error",error)
    process.exit(1)

    }

}

export default DbConnection