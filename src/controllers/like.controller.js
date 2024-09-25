import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Use consistent naming: videoId instead of VideoId
    const liked = await Like.findOne({
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: new mongoose.Types.ObjectId(userId)
    });

    if (!liked) {
        const newLike = await Like.create({
            video: videoId,  // Use consistent naming: videoId instead of VideoId
            likedBy: userId  // Use consistent naming: likedBy instead of owner
        });

        // Use 201 for successful resource creation
        res.status(201).json(new ApiResponse(201, newLike, "Liked!!"));
    }

    const unliked = await Like.findByIdAndDelete(liked._id);

    // Use 200 for successful general requests
    res.status(200).json(new ApiResponse(200, unliked, 'Unliked successfully !!'));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
    // Remove unused comment
    const liked = await Like.findOne({
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(userId)
    });

    if (!liked) {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: userId  // Use consistent naming: likedBy instead of owner
        });

        // Use 201 for successful resource creation
        res.status(201).json(new ApiResponse(201, newLike, "Liked!!"));
    }

    const unliked = await Like.findByIdAndDelete(liked._id);

    // Use 200 for successful general requests
    res.status(200).json(new ApiResponse(200, unliked, 'Unliked successfully !!'));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const liked = await Like.findOne({
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy: new mongoose.Types.ObjectId(userId)
    });

    if (!liked) {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: userId  // Use consistent naming: likedBy instead of owner
        });

        // Use 201 for successful resource creation
        res.status(201).json(new ApiResponse(201, newLike, "Liked!!"));
    }

    const unliked = await Like.findByIdAndDelete(liked._id);

    // Use 200 for successful general requests
    res.status(200).json(new ApiResponse(200, unliked, 'Unliked successfully !!'));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find all likes by the user, populating the 'video' field to get details of the liked videos
    const likedVideos = await Like.find({ likedBy: userId }).populate('video');

    if (likedVideos.length === 0) {
        res.status(200).json(new ApiResponse(200, [], 'No liked videos found.'));
    } else {
        res.status(200).json(new ApiResponse(200, likedVideos, 'Liked videos fetched successfully'));
    }
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};