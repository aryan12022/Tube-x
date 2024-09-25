import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getPlaylistById, getUserPlaylists, createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);

router.route('/getPlaylist/:playlistId').get(getPlaylistById);
router.route('/getUserPlaylists/:userId').get(getUserPlaylists);
router.route('/createPlaylist').post(createPlaylist);
router.route('/addVideoToPlaylist/:playlistId/:videoId').post(addVideoToPlaylist);
router.route('/removeVideoFromPlaylist/:playlistId/:videoId').post(removeVideoFromPlaylist);
router.route('/deletePlaylist/:playlistId').delete(deletePlaylist);
router.route('/updatePlaylist/:playlistId').patch(updatePlaylist);

export default router;