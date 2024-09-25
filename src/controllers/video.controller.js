import { Video } from '../models/video.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Get all videos with pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Validate userId
    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new ApiError(401, 'Invalid userId');
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    let output = {};
    let aggregate = Video.aggregate();

    // Add conditions to the aggregation pipeline based on parameters
    if (userId) {
        aggregate.match({ owner: new mongoose.Types.ObjectId(userId) });
    }

    try {
        const result = await Video.aggregatePaginate(aggregate, options);
        output = result;
    } catch (err) {
        throw new ApiError(404, 'Not found !!');
    }

    res.status(200).json(new ApiResponse(200, output, 'Videos Fetched !!'));
});

// Publish a video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user._id;

    let videoFilePath = "";
    let thumbnailPath = "";

    // Validate user input
    if (!title || !description || !userId) {
        throw new ApiError(401, "Didn't get userId or title or description");
    }

    // Validate and retrieve file paths
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFilePath = req.files.videoFile[0].path;
    }

    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailPath = req.files.thumbnail[0].path;
    }

    if (videoFilePath === "") {
        throw new ApiError(401, 'videoFile required !!');
    }

    const videoFile = await uploadOnCloudinary(videoFilePath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailPath);

    if (!videoFile) {
        throw new ApiError(401, 'Failed to upload videoFile to Cloudinary');
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnailFile?.url || '',
        duration: videoFile?.duration || 0,
        owner: userId
    });

    res.status(200).json(new ApiResponse(200, video, 'Video published !!'));
});

// Get a video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(401, 'Invalid videoId format');
    }

    const video = await Video.findById(videoId);
    res.status(200).json(new ApiResponse(200, video ?? 'No videos found', 'Video Fetched !!'));
});

// Update a video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnail = req.file.path;

    // Validate user input
    if (!title || !description || !thumbnail) {
        throw new ApiError(401, 'title and description and thumbnail required !!');
    }

    // Validate videoId
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(401, 'Invalid videoId format');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'video not found !!');
    }

    const thumbnailupload = await uploadOnCloudinary(thumbnail);

    if (!thumbnailupload) {
        throw new ApiError(500, 'thumbnail upload failed !!');
    }

    video.title = title;
    video.description = description;
    video.thumbnail = thumbnailupload?.url;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, 'video updated successfully !!'));
});

// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(401, 'Invalid videoId format');
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(404, 'Video not found in db, try again');
    }

    const deleteVideo = await deleteFromCloudinary(deletedVideo.videoFile);
    const deleteThumbnail = await deleteFromCloudinary(deletedVideo.thumbnail);

    res.status(200).json(new ApiResponse(200, deletedVideo, 'Video deleted successfully'));
});

// Toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const existingVideo = await Video.findById(videoId);

    if (!existingVideo) {
        throw new ApiError(404, 'Video not found');
    }

    const newPublishStatus = !existingVideo.isPublished;
    const updatedStatusVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: newPublishStatus } },
        { new: true }
    );

    if (updatedStatusVideo) {
        res.status(200).json(new ApiResponse(200, updatedStatusVideo, 'Publish status toggled successfully'));
    }
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};