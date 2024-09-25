import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const owner = req.user._id;

    // Check if content exists
    if (!content) {
        throw new ApiError(400, 'Content required for Tweet !!'); 
    }

    const tweet = await Tweet.create({
        content,
        owner
    });

    // Check if the tweet was created successfully
    if (!tweet) {
        throw new ApiError(500, 'Error in creating Tweet !!');
    }

    res.status(201).json(new ApiResponse(201, tweet, 'Tweet created successfully !!')); 
});

// Get tweets for a specific user
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Check if userId exists
    if (!userId) {
        throw new ApiError(400, 'Userid required!!'); 
    }

    const tweets = await Tweet.find({ owner: userId });

    // Check if tweets were found
    if (!tweets || tweets.length === 0) { 
        throw new ApiError(404, "No tweets found for the user !!"); 
    }

    res.status(200).json(new ApiResponse(200, tweets, 'User tweets fetched !!'));
});

// Update a tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Check if tweetId and content exist
    if (!tweetId) {
        throw new ApiError(400, 'Tweet Id required !!'); 
    }
    if (!content) {
        throw new ApiError(400, 'Content required !!'); 
    }

    // Find and update the tweet
    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: userId },
        { $set: { content } },
        { new: true }
    );

    // Check if tweet was found and updated
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found or user does not own the tweet !!');
    }

    res.status(200).json(new ApiResponse(200, tweet, 'Tweet updated successfully !!'));
});

// Delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Check if tweetId exists
    if (!tweetId) {
        throw new ApiError(400, 'TweetId required!!'); 
    }

    // Find and delete the tweet
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    // Check if tweet was found and deleted
    if (!deletedTweet) {
        throw new ApiError(404, 'Tweet not found !!');
    }

    res.status(200).json(new ApiResponse(200, deletedTweet, 'Tweet Deleted !!'));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};