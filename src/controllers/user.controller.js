import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req, res) => {
    
    // steps to registering a user

    // get user details from frontend (username, email, password etc.)
    // validation of user details - not empty
    // check if user already existed - email, username
    // check for images - avatar, coverImage
    // Upload Images on cloudinary - avatar is must
    // user creation object - entry in db
    // check for user creation
    // remove password and refreshToken (fields) from response
    // return response

    const {fullName, email, password, username} = req.body
    console.log("email:", email)

    if([username, email, password, fullName].some((item) => item.trim() === "")){
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [
            { email }, { username }
        ]
    })

    if(existedUser){
        throw new apiError(409, "user already existed with this email or username")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required")
    }

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar file is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage.url
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "Failed to registering a user in database.")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User added successfully")
    )
})


export {
    registerUser
}