import {Router} from 'express'
import {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
} from '../controllers/subscription.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'
const router = Router()

router.use(verifyJWT)

router.route('/:channelId').get(getUserChannelSubscribers)
router.route('/getSubscribedChannels/:subscriberId').get(getSubscribedChannels)
router.route('/toggleSubscription/:channelId').patch(toggleSubscription)

export default router;