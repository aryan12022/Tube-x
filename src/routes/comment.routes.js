import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getVideoComments, addComment, deleteComment, updateComment } from '../controllers/comment.controller.js'

const router = Router()

router.use(verifyJWT)
router.route('/addComment/:videoId').post(addComment);
router.route('/:videoId').get(getVideoComments)
router.route('/deleteComment/:commentId').get(deleteComment)
router.route('/updateComment/:commentId').patch(updateComment)
export default router;