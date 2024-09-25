import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo
} from '../controllers/video.controller.js';

import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Middleware for JWT verification
router.use(verifyJWT);

// Public routes
router.route('/').get(getAllVideos).post(upload.fields(
    [
        {
            name: 'videoFile',
            maxCount: 1,
        },
        {
            name: 'thumbnail',
            maxCount: 1,
        }
    ]
), publishAVideo);

// Protected routes
router.route('/:videoId').get(getVideoById).delete(deleteVideo).patch(upload.single('thumbnail'), updateVideo);

// Toggle video publish status
router.route('/toggle/publish/:videoId').patch(togglePublishStatus);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

export default router;