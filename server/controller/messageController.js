import chatModel from '../models/chatModel.js';
import messageModal from '../models/messageModal.js';
import userModel from '../models/userModel.js';

// Create Message
export const sendMessage = async (req, res) => {
  try {
    const { content, chatId, contentType } = req.body;
    if (!content || !chatId) {
      return res.status(400).json({ message: 'Invaild data passed into request' });
    }

    const newMessage = {
      sender: req.user._id,
      content: content,
      contentType: contentType,
      chat: chatId,
    };

    var message = await messageModal.create({ ...newMessage });

    message = await message.populate('sender', 'name email avatar role isOnline');
    message = await message.populate('chat');
    message = await userModel.populate(message, {
      path: 'chat.users',
      select: 'name email avatar role isOnline',
    });

    await chatModel.findByIdAndUpdate(
      { _id: chatId },
      { latestMessage: message.toObject() },
      { new: true }
    );

    // Add unread markers for all chat users except sender
    const chat = await chatModel.findById(chatId).select('users');
    if (chat?.users?.length) {
      const unreadFor = chat.users.filter((u) => String(u) !== String(req.user._id));
      if (unreadFor.length) {
        await chatModel.updateOne(
          { _id: chatId },
          {
            $push: {
              unreadMessages: {
                $each: unreadFor.map((uid) => ({ messageId: message._id, userId: uid })),
              },
            },
          }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Message created successfully!',
      message: message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while post message!',
      error: error,
    });
  }
};

// Get All Messages
export const getMessages = async (req, res) => {
  try {
    const messages = await messageModal
      .find({ chat: req.params.id })
      .populate('sender', 'name email avatar role isOnline')
      .populate('chat');

    res.status(200).json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while get messages!',
      error: error,
    });
  }
};

// Mark messages as read for a user in a chat
export const markMessagesRead = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id;
    if (!chatId) {
      return res.status(400).json({ success: false, message: 'Chat id is required!' });
    }

    await chatModel.updateOne({ _id: chatId }, { $pull: { unreadMessages: { userId } } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while marking messages as read!',
      error: error,
    });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!messageId || !emoji) {
      return res
        .status(400)
        .json({ success: false, message: 'Message ID and emoji are required!' });
    }

    const message = await messageModal.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found!' });
    }

    const reactions = Array.isArray(message.reactions) ? [...message.reactions] : [];
    const reactionIndex = reactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex >= 0) {
      // Reaction exists, add user if not already present
      const userIds = new Set(reactions[reactionIndex].userIds?.map((id) => String(id)) || []);
      if (!userIds.has(String(userId))) {
        userIds.add(String(userId));
        reactions[reactionIndex].userIds = Array.from(userIds).map((id) => id);
      }
    } else {
      // New reaction
      reactions.push({ emoji, userIds: [userId] });
    }

    await messageModal.findByIdAndUpdate(messageId, { reactions });

    const updated = await messageModal.findById(messageId);

    res.status(200).json({
      success: true,
      message: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while adding reaction!',
      error: error,
    });
  }
};
