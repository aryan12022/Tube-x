import {Router} from 'express'
import { getChannelStats,getChannelVideos } from '../controllers/dashboard.controller.js';
const router = Router()

router.route('/getChannelStats/:channelId').get(getChannelStats)
router.route('/getChannelVideos/:channelId').get(getChannelVideos)

export default router;