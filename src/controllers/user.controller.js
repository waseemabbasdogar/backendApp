import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new apiError(500, "something went wrong while generating tokens")
    }
}


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

    // const avatarLocalPath = req.files?.avatar[0]?.path

    // if(!avatarLocalPath){
    //     throw new apiError(400, "Avatar file is required")
    // }

    // let coverImageLocalPath;

    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)

    // if(!avatar){
    //     throw new apiError(400, "Avatar file is required")
    // }

    // const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        // avatar: avatar.url,
        // coverImage: coverImage.url
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

const loginUser = asyncHandler( async (req, res) => {
    // get user details (email, username, password)
    // find user from db
    // check password
    // generate tokens
    // send cookie

    const {username, email, password} = req.body

    if(!username || !email){
        throw new apiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [
            {username}, {email}
        ]
    })

    if(!user) {
        throw new apiError(404, "user does not exist.")
    }

    const passwordValidation = await user.isPasswordCorrect(password)

    if(!passwordValidation){
        throw new apiError(401, "Invalid user password")
    }

    const {accessToken, refreshToken} = await generateTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})


const logoutUser = asyncHandler( async (req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(200, {}, "User logged Out")
        )
})


export {
    registerUser,
    loginUser,
    logoutUser
}