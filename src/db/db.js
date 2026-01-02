import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async () => {
    try {
        const dbConnection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected successfully !! DB Host ${dbConnection.connection.host}`)
    } catch (error) {
        console.error(`Failed to connect to database`, error)
        process.exit(1)
    }
}

export default connectDB;