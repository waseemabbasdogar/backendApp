import dotenv from 'dotenv'
import connectDB from './db/db.js'
import { app } from './app.js'

// import mongoose from 'mongoose'
// import { DB_NAME } from './constants.js'
// import express from 'express'


dotenv.config({
    path: "./.env"
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`❄ Server is running on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log(`Error after connecting to database.`, error)
        throw error
    })

















// const app = express();

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log(`Error while talking to server`, error)
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening perfectly on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log(`Error while connecting to database`, error)
//         throw error
//     }
// })()