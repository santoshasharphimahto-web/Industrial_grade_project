// require('dotenv').config({path:"./env"})
import dotenv from "dotenv"
import DbConnection from "./Db/index.js";
import express from "express";
import app from "../src/app.js"


dotenv.config({ 
  path:"./env"
})



DbConnection()
.then(()=>{
  app.on('error',(error)=>{
    console.log("Error: ",error) 

  })
   app.listen(process.env.PORT,()=>{
    console.log(`app is running on a port${process.env.PORT}`)
   })

})
.catch((error)=>{
  console.log('mongodb failed to connect!!! ',error)

})
















/*( async ( )=>{

  try {
   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
   app.on('error',(error)=>{
    console.log("Error: ",error)
    throw error
   })

   app.listen(process.env.PORT,()=>{
    console.log(`app is currentely working on ${process.env.PORT}`)
   })

  } catch(err){
    console.log("Error: ",err)
    throw err

  }

})()*/