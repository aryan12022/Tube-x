import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { deleteFromCloudinary } from '../utils/cloudinary.js'
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not incorrect format
    // check if user already exist
    //check for images ,check for avatar
    //upload them to cloudinary,avatar
    //create user object - create entry in db 
    //remove password and refresh token from response
    //check for user creation
    //return response
    const { fullName, email, username, password } = req.body
    console.log("email:", email)
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields are required !!")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log(req.body, "      ", req.files)
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files?.avatar[0]?.path;
    }
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
    })
    // console.log('here')
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Internal server error")

    }
    // console.log("------->", createdUser)
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )

})
const loginUser = asyncHandler(async (req, res) => {
    //req->body data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie
    const { email, username, password } = req.body
    if (!username && !email) {
        throw new ApiError(400, "username & password is required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    const isPasswordValid = await user.isPasswrordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, 'Password incorrect!')
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, refreshToken, accessToken
        }, "Userlogged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    const id = req.user._id;
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, {
        new: true,
    }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options)
        .clearCookie("refreshToken", options).json(
            new ApiResponse(200, {}, "User logged out successfully")
        )

})
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request")
        }
        // console.log(incomingRefreshToken)
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        let _id = decodedToken._id
        const user = await User.findById({ _id })
        if (!user) {
            throw new ApiError(401, "invalid refresh token !!")
        }
        // console.log(user.refreshToken,user)
        if (incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used')
        }
        const options = {
            httpOnly: true,
            secure: true,
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefereshTokens(user?._id)
        return res.status(200)
            .cookie('accessToken', accessToken).
            cookie('refreshToken', newrefreshToken).json(new ApiResponse(200, { accessToken, newrefreshToken }, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Internal server error")
    }
})

const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    // console.log(oldPassword,newPassword,'gkhgk')
    const user_id = req.user?._id
    const user = await User.findById(user_id)
    console.log(user)
    const isPasswordCorrect = await user.isPasswrordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, 'Invalid old password')
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {}, "Password Updated !!"))
})
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, 'User fetched successfully !!'))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError(400, 'All fields are required !!')
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        }, { new: true }).select("-password")
    return res.status(200).json(new ApiResponse(200, user, 'user updated!!'))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is missing')

    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, 'Error while updating avatar')
    }
    const person = await User.findById(req.user?._id);
    const prevUrl = person.avatar;
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    }
        , { new: true }
    ).select("-password")
    deleteFromCloudinary(prevUrl)
    return res.status(200).json(new ApiResponse(200, user, "avatar updated"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path
    if (!coverLocalPath) {
        throw new ApiError(400, 'cover image is missing')

    }
    const coverImage = await uploadOnCloudinary(coverLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, 'Error while updating cover image')
    }
    const person = await User.findById(req.user?._id);
    const prevUrl = person.coverImage;
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    }
        , { new: true }
    ).select("-password")
    deleteFromCloudinary(prevUrl)
    return res.status(200).json(new ApiResponse(200, user, "cover image updated"))

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, 'Channel name not found !!')
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: "channel",
                as: 'subscribers'
            }
        }, {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo'
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    }
                }
            }
        }, {
            $project: {
                fullName: 1,
                email: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
            }
        }
    ])

    console.log(channel)
    if (!channel?.length) {
        throw new ApiError(404, 'channel does not exists !!')
    }
    return res.status(200)
        .json(new ApiResponse(200, channel[0], 'User channel fetched successfully'))

})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner',
                            }
                        }
                    }
                ]
            }
        }

    ])
    return res.status(200)
        .json(new ApiResponse(200, user[0].watchHistory, 'watch history successfully fetched !!'))
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    changeUserPassword,
    updateAccountDetails,
}