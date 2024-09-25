import Router from 'express'
import {
    createTweet,
    deleteTweet,
    updateTweet,
    getUserTweets,
} from '../controllers/tweet.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
const router = Router()
router.use(verifyJWT)
router.route('/createTweet').post(createTweet)
router.route('/deleteTweet/:tweetId').delete(deleteTweet)
router.route('/updateTweet/:tweetId').patch(updateTweet)
router.route('/getallTweets/:userId').get(getUserTweets)


export default router;