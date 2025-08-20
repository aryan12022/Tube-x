// // require('dotenv').config({path:"./env"})
// import dotenv from 'dotenv'
// import mongoose from 'mongoose'
// // import { DB_NAME } from './constants';
// import { swaggerDocs } from "./swagger.js"; // import swagger


// import connectDB from './db/index.js';
// import {app} from './app.js'

// dotenv.config({
//     path:'./.env'
// })


// swaggerDocs(app);


// connectDB()
// .then(()=>{
//       app.listen(process.env.PORT|| 8000,()=>{
//         console.log(`🛜 Listning at PORT ${process.env.PORT}`)
//       })
// })
// .catch((err)=>{
//    console.log("Mongo db connection faile !!!",err)
// })

// app.get("/", (req, res) => {
//   res.json([{ id: 1, name: "Aryan" }]);
// });

// import express from 'express';
// const app = express()
//     ; (async () => {
//         try {
//             db = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//             app.on("error", (error) => {
//                 console.log("ERROR: ", error);
//                 throw error;
//             })
//             app.listen(process.env.PORT, () => {
//                 console.log(`App is listening on port ${process.env.PORt}`)
//             })
//         } catch (error) {
//             console.error("Error: ", error)
//         }
//     })








/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { swaggerDocs } from "./swagger.js"; // ✅ Swagger

dotenv.config({
  path: "./.env",
});

// 👉 Connect DB, then start server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;

    // ✅ Swagger should be initialized *before* starting server
    swaggerDocs(app);

    app.listen(PORT, () => {
      console.log(`🛜 Listening at PORT ${PORT}`);
      console.log(`📑 Swagger available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed !!!", err);
  });

// 👉 Example test route
app.get("/", (req, res) => {
  res.json([{ id: 1, name: "Aryan" }]);
});
