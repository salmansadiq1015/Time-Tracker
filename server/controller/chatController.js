import chatModel from '../models/chatModel.js';
import userModel from '../models/userModel.js';

// Create Chat Controller
export const createChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send({
        success: false,
        message: 'User id is required!',
      });
    }

    // Check if Chat already Exist
    var isChat = await chatModel
      .find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      })
      .populate('users', '-password')
      .populate('latestMessage');

    isChat = await userModel.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'name email avatar role status isOnline',
    });

    if (isChat.length > 0) {
      return res.status(200).send({
        success: true,
        message: 'Chat already exists',
        chat: isChat[0],
      });
    } else {
      var chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await chatModel.create(chatData);
      const fullChat = await chatModel
        .findById({ _id: createdChat._id })
        .populate('users', '-password ');

      res.status(200).send({
        success: true,
        message: 'Chat Created!',
        chat: fullChat,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while create chat!',
      error: error,
    });
  }
};

// Fetch  Chats
export const fetchChats = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).send({ success: false, message: 'User id is required!' });
    }

    await chatModel
      .find({ users: { $elemMatch: { $eq: userId } } })
      .populate('users', '-password ')
      .populate('groupAdmin', '-password ')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await userModel.populate(results, {
          path: 'latestMessage.sender',
          select: 'name email avatar role status isOnline',
        });
        res.status(200).send({
          results: results,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while fetch chat!',
      error: 'error',
    });
  }
};

// Create Group Chat
export const groupChat = async (req, res) => {
  try {
    const { users, chatName, avatar } = req.body;
    if (!chatName || !users) {
      return res.status(400).send({
        success: false,
        message: 'Group name and users are required!',
      });
    }
    if (!avatar) {
      return res.status(400).send({
        success: false,
        message: 'Group avatar are required!',
      });
    }

    const userData = JSON.parse(users);

    if (userData.length < 2) {
      return res.status(400).send({
        success: false,
        message: 'Please select at least 2 users!',
      });
    }
    userData.push(req.user._id);

    const isExisting = await chatModel.findOne({
      chatName: chatName,
      isGroupChat: true,
    });

    if (isExisting) {
      return res.status(400).send({
        success: false,
        message: `Group with ${
          isExisting.chatName || 'this'
        } name already exist, use another name!`,
      });
    }

    const groupChat = await chatModel.create({
      chatName: chatName,
      users: userData,
      isGroupChat: true,
      avatar: avatar,
    });

    // Fetch Group
    const fullGroupChat = await chatModel
      .findById({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).send({
      success: true,
      message: 'Group chat created successfully!',
      groupChat: fullGroupChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while create group chat!',
      error: error,
    });
  }
};

// Fetch Single Group Chat
export const fetchGroupChat = async (req, res) => {
  try {
    const chatId = req.params.id;

    if (!chatId) {
      return res.status(400).send({ success: false, message: 'Chat id is required!' });
    }

    await chatModel
      .find({ _id: chatId })
      .populate('users', 'name email ')
      .populate('groupAdmin', 'name email ')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await userModel.populate(results, {
          path: 'latestMessage.sender',
          select: 'name email ',
        });

        res.status(200).send({
          result: results,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while fetch group chat!',
      error: 'error',
    });
  }
};

// Update Group
export const updateGroupChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { users, chatName, avatar } = req.body;
    if (!chatName || !users) {
      return res.status(400).send({
        success: false,
        message: 'Group name and users are required!',
      });
    }
    if (!avatar) {
      return res.status(400).send({
        success: false,
        message: 'Group avatar are required!',
      });
    }

    const userData = JSON.parse(users);

    if (userData.length < 2) {
      return res.status(400).send({
        success: false,
        message: 'Please select at least 2 users!',
      });
    }
    userData.push(req.user._id);

    const isExisting = await chatModel.findById({ _id: chatId });

    const groupChat = await chatModel.findByIdAndUpdate(
      { _id: isExisting._id },
      {
        chatName: chatName,
        users: userData,
        avatar: avatar,
      },
      { new: true }
    );

    // Fetch Group
    const fullGroupChat = await chatModel
      .findById({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).send({
      success: true,
      message: 'Group chat created successfully!',
      groupChat: fullGroupChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while create group chat!',
      error: error,
    });
  }
};

// Rename Group
export const renameGroup = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { chatName } = req.body;

    if (!chatName) {
      return res.status(400).send({
        success: false,
        message: 'Name is required!',
      });
    }
    const updateChat = await chatModel
      .findByIdAndUpdate({ _id: chatId }, { chatName: chatName }, { new: true })
      .populate('users', '-password ')
      .populate('groupAdmin', '-password ');

    res.status(200).send({
      success: true,
      message: 'Group name updated!',
      chat: updateChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while rename group!',
      error: error,
    });
  }
};

// Remove User
export const removeUser = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      res.status(200).send({
        success: false,
        message: 'User id is required!',
      });
    }

    const chat = await chatModel
      .findByIdAndUpdate({ _id: chatId }, { $pull: { users: userId } }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).send({
      success: true,
      message: 'User remove from group!',
      chat: chat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while remove user!',
      error: error,
    });
  }
};

// Add User
export const addUser = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      res.status(200).send({
        success: false,
        message: 'User id is required!',
      });
    }

    const chat = await chatModel
      .findByIdAndUpdate({ _id: chatId }, { $push: { users: userId } }, { new: true })
      .populate('users', '-password ')
      .populate('groupAdmin', '-password ');

    res.status(200).send({
      success: true,
      message: 'User add from group!',
      chat: chat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while add user!',
      error: error,
    });
  }
};

// Delete Chat
export const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;

    if (!chatId) {
      res.status(400).send({
        success: false,
        message: 'Chat id is required!',
      });
    }

    await chatModel.findByIdAndDelete(chatId);

    res.status(200).send({
      success: true,
      message: 'Chat Deleted!',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while delete user!',
      error: error,
    });
  }
};
