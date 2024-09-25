import { Subscription } from '../models/subscription.model.js'
import { User } from '../models/user.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id; // Assuming you have the user ID in the request

    // Check if the user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });

    if (existingSubscription) {
        // If already subscribed, unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id);
        res.status(200).json(new ApiResponse(200, null, 'Unsubscribed successfully'));
    } else {
        // If not subscribed, subscribe
        const newSubscription = await Subscription.create({ subscriber: subscriberId, channel: channelId });
        res.status(200).json(new ApiResponse(200, newSubscription, 'Subscribed successfully'));
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, 'Channel does not exist !!');
    }

    const subscribers = await Subscription.find({ channel: channel._id })
    const totalSubscribers = subscribers.length;

    res.status(200).json(new ApiResponse(200, {subscribers,totalSubscribers}, 'Subscribers fetched !!'));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(401, 'Subscriber Id required !!');
    }

    const channels = await Subscription.find({ subscriber: subscriberId })

    res.status(200).json(new ApiResponse(200, channels, 'Subscribed Channels Fetched !!'));
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}