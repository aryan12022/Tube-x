import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, 'Send a valid channelId !!');
    }

    // Fetch total subscribers
    const subscribers = await Subscription.find({ channel: channelId });
    if (!subscribers) {
        throw new ApiError(500, 'Internal server error while fetching total subscribers !!');
    }
    const totalSubscribers = subscribers.length;

    // Fetch total videos
    const videos = await Video.find({ owner: channelId });
    if (!videos) {
        throw new ApiError(500, 'Internal server error while fetching total videos !!');
    }
    const totalVideos = videos.length;

    // Calculate total views and likes
    let totalViews = 0;
    let totalLikes = 0;

    for (const video of videos) {
        totalViews += video.views;

        // Fetch likes for each video
        const likes = await Like.find({ video: video._id });
        if (likes && likes.length > 0) {
            totalLikes += likes.length;
        }
    }

    // Respond with the collected statistics
    res.status(200).json(new ApiResponse(200, {
        totalLikes,
        totalSubscribers,
        totalVideos,
        totalViews
    }));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, 'Send a valid channelId !!');
    }

    // Fetch videos for the channel
    const videos = await Video.find({
        owner: channelId,
        isPublished: true,
    });

    if (!videos) {
        throw new ApiError(500, "Internal server error in video fetching !!");
    }

    res.status(200).json(new ApiResponse(200, videos, 'Videos fetched successfully !!'));
});

export {
    getChannelStats,
    getChannelVideos
};