import { Router } from 'express';
import { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos } from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT)
router.route("/videoLikeToggle/:videoId").post(toggleVideoLike);
router.route("/commentLikeToggle/:commentId").post(toggleCommentLike);
router.route("/tweetLikeToggle/:tweetId").post(toggleTweetLike);
router.route("/likedVideos").get(getLikedVideos);

export default router;