import { Comment } from '../models/comment.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// Retrieve comments for a video with pagination
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };
    let aggregate = Comment.aggregate();

    if (videoId) {
        aggregate.match({ video: new mongoose.Types.ObjectId(videoId) });
    }

    const result = await Comment.aggregatePaginate(aggregate, options);

    if (result) {
        res.status(200).json(new ApiResponse(200, result, "Comments Fetched !!"));
    }
});

// Add a new comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const user_id = req.user._id;

    if (!content) {
        throw new ApiError(400, 'Content is required !!'); // Adjusted status code
    }

    const comment = await Comment.create({
        video: videoId,
        owner: user_id,
        content,
    });

    res.status(201).json(new ApiResponse(201, comment, 'Comment Added')); // Changed status to 201 for resource creation
});

// Update an existing comment
const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const user_id = req.user._id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, 'Comment not found !!');
    }

    if (user_id.toString() !== comment.owner.toString()) {
        throw new ApiError(401, 'You are not authorized to update this comment!!');
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content } },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(500, 'Internal server error in updating comment');
    }

    res.status(200).json(new ApiResponse(200, updatedComment, 'Comment updated successfully!!'));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, 'Comment not found !!');
    }

    if (userId.toString() !== comment.owner.toString()) {
        throw new ApiError(401, 'You are not authorized to delete this comment !!');
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    res.status(200).json(new ApiResponse(200, deletedComment, 'Comment deleted successfully !!'));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};