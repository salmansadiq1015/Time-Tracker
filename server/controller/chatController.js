import chatModel from '../models/chatModel.js';
import userModel from '../models/userModel.js';
import projectModel from '../models/projectModel.js';
import mongoose from 'mongoose';

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

    const requester = await userModel.findById(req.user?._id || userId).select('role');

    if (!requester) {
      return res.status(404).send({ success: false, message: 'Requesting user not found!' });
    }

    const isAdmin = requester.role === 'admin';

    const query = isAdmin ? {} : { users: { $elemMatch: { $eq: userId } } };

    await chatModel
      .find(query)
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

    // Get existing chat data before update to compare users
    const existingChat = await chatModel.findById(chatId).lean();
    if (!existingChat) {
      return res.status(404).send({
        success: false,
        message: 'Chat not found!',
      });
    }

    // Convert all user IDs to strings for comparison
    const normalizeId = (id) => {
      if (!id) return null;
      if (typeof id === 'string') return id;
      if (id.toString) return id.toString();
      if (id._id) return id._id.toString();
      return String(id);
    };

    const oldUserIds = (existingChat.users || []).map(normalizeId).filter(Boolean);
    const newUserIds = userData.map(normalizeId).filter(Boolean);

    // Find users that were added (in new but not in old)
    const addedUsers = newUserIds.filter((id) => !oldUserIds.includes(id));
    // Find users that were removed (in old but not in new)
    const removedUsers = oldUserIds.filter((id) => !newUserIds.includes(id));

    // Update the group chat
    const groupChat = await chatModel.findByIdAndUpdate(
      { _id: chatId },
      {
        chatName: chatName,
        users: userData,
        avatar: avatar,
      },
      { new: true }
    );

    // Sync with associated project(s) if it's a group chat
    if (existingChat.isGroupChat && chatName) {
      try {
        const chatNameTrimmed = chatName.trim();
        const projects = await projectModel.find({ name: chatNameTrimmed }).lean();

        if (projects.length > 0) {
          console.log(`📋 Found ${projects.length} project(s) with name "${chatNameTrimmed}"`);

          for (const project of projects) {
            // Convert project employee IDs to strings for comparison
            const projectEmployeeIds = (project.employees || []).map(normalizeId).filter(Boolean);

            // Add new users to project
            if (addedUsers.length > 0) {
              for (const userId of addedUsers) {
                // Convert to ObjectId for database operations
                let userIdObjectId = userId;
                if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
                  userIdObjectId = new mongoose.Types.ObjectId(userId);
                }

                // Only add if not already in project
                if (!projectEmployeeIds.includes(userId)) {
                  await projectModel.updateOne(
                    { _id: project._id },
                    { $addToSet: { employees: userIdObjectId } }
                  );
                  console.log(`   ✅ Added user ${userId} to project "${project.name}"`);
                }
              }
            }

            // Remove users from project
            if (removedUsers.length > 0) {
              for (const userId of removedUsers) {
                // Convert to ObjectId for database operations
                let userIdObjectId = userId;
                if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
                  userIdObjectId = new mongoose.Types.ObjectId(userId);
                }

                // Only remove if currently in project
                if (projectEmployeeIds.includes(userId)) {
                  // Try with ObjectId first
                  let updateResult = await projectModel.updateOne(
                    { _id: project._id },
                    { $pull: { employees: userIdObjectId } }
                  );

                  // If ObjectId didn't work, try with string
                  if (updateResult.modifiedCount === 0 && typeof userId === 'string') {
                    updateResult = await projectModel.updateOne(
                      { _id: project._id },
                      { $pull: { employees: userId } }
                    );
                  }

                  if (updateResult.modifiedCount > 0) {
                    console.log(`   ✅ Removed user ${userId} from project "${project.name}"`);
                  }
                }
              }
            }
          }

          console.log(
            `✅ Synced ${addedUsers.length} added and ${removedUsers.length} removed users with ${projects.length} project(s)`
          );
        } else {
          console.log(`⚠️ No projects found with name "${chatNameTrimmed}" to sync with`);
        }
      } catch (projectError) {
        console.error('❌ Error syncing with project:', projectError);
        // Continue even if project sync fails
      }
    }

    // Fetch Group
    const fullGroupChat = await chatModel
      .findById({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).send({
      success: true,
      message: 'Group chat updated successfully!',
      groupChat: fullGroupChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while update group chat!',
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
      return res.status(400).send({
        success: false,
        message: 'User id is required!',
      });
    }

    // Convert userId to ObjectId if it's a string
    let userIdObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObjectId = new mongoose.Types.ObjectId(userId);
    } else if (typeof userId === 'string') {
      // If it's a string but not a valid ObjectId, try to convert anyway
      try {
        userIdObjectId = new mongoose.Types.ObjectId(userId);
      } catch (e) {
        console.error('Invalid userId format:', userId);
        return res.status(400).send({
          success: false,
          message: 'Invalid user id format!',
        });
      }
    }

    // Get the chat to check if it's a group chat and get the chat name
    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).send({
        success: false,
        message: 'Chat not found!',
      });
    }

    console.log(
      `🔍 Removing user ${userId} (ObjectId: ${userIdObjectId}) from chat: ${chat.chatName} (isGroupChat: ${chat.isGroupChat})`
    );

    // Remove user from group chat
    const updatedChat = await chatModel
      .findByIdAndUpdate({ _id: chatId }, { $pull: { users: userIdObjectId } }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    // If it's a group chat, also remove user from associated project (matching by name)
    if (chat.isGroupChat && chat.chatName) {
      try {
        const chatNameTrimmed = chat.chatName.trim();
        console.log(`🔍 Looking for projects with name: "${chatNameTrimmed}"`);

        const projects = await projectModel.find({ name: chatNameTrimmed }).lean();
        console.log(`📋 Found ${projects.length} project(s) with name "${chatNameTrimmed}"`);

        if (projects.length > 0) {
          let totalModified = 0;

          for (const project of projects) {
            const employeeIds = project.employees.map((emp) =>
              emp.toString ? emp.toString() : emp._id ? emp._id.toString() : String(emp)
            );
            const hasUserBefore =
              employeeIds.includes(userIdObjectId.toString()) || employeeIds.includes(userId);

            if (hasUserBefore) {
              try {
                let updateResult = await projectModel.updateOne(
                  { _id: project._id },
                  { $pull: { employees: userIdObjectId } }
                );

                if (updateResult.modifiedCount > 0) {
                  totalModified++;
                  console.log(
                    `    ✅ Removed user using ObjectId (modified: ${updateResult.modifiedCount})`
                  );
                } else if (typeof userId === 'string') {
                  // If ObjectId didn't work, try with string format
                  updateResult = await projectModel.updateOne(
                    { _id: project._id },
                    { $pull: { employees: userId } }
                  );

                  if (updateResult.modifiedCount > 0) {
                    totalModified++;
                    console.log(
                      `    ✅ Removed user using string format (modified: ${updateResult.modifiedCount})`
                    );
                  } else {
                    // Last resort: manual filter and set
                    const filteredEmployees = project.employees.filter((emp) => {
                      const empId = emp.toString
                        ? emp.toString()
                        : emp._id
                        ? emp._id.toString()
                        : String(emp);
                      return empId !== userIdObjectId.toString() && empId !== userId;
                    });

                    if (filteredEmployees.length < project.employees.length) {
                      updateResult = await projectModel.updateOne(
                        { _id: project._id },
                        { $set: { employees: filteredEmployees } }
                      );
                      if (updateResult.modifiedCount > 0) {
                        totalModified++;
                        console.log(
                          `    ✅ Removed user using manual filter (modified: ${updateResult.modifiedCount})`
                        );
                      }
                    } else {
                      console.log(`    ⚠️ User not found in employees array despite initial check`);
                    }
                  }
                }

                // Verify final state
                const verifyProject = await projectModel.findById(project._id).lean();
                const verifyEmployeeIds = verifyProject.employees.map((emp) =>
                  emp.toString ? emp.toString() : emp._id ? emp._id.toString() : String(emp)
                );
                const stillHasUser =
                  verifyEmployeeIds.includes(userIdObjectId.toString()) ||
                  verifyEmployeeIds.includes(userId);
                console.log(
                  `    Final verification: User still in project: ${stillHasUser}, employees count: ${verifyProject.employees.length}`
                );
              } catch (e) {
                console.error(`    ❌ Error removing user from project ${project._id}:`, e.message);
                console.error(`    Stack:`, e.stack);
              }
            } else {
              console.log(`    ℹ️ User not found in project employees, skipping removal`);
            }
          }

          console.log(
            `✅ Removed user ${userId} from ${totalModified} out of ${projects.length} project(s) with name "${chatNameTrimmed}"`
          );
        } else {
          console.log(`⚠️ No projects found with name "${chatNameTrimmed}" to remove user from`);
          // Try case-insensitive search as fallback
          const caseInsensitiveProjects = await projectModel.find({
            name: { $regex: new RegExp(`^${chatNameTrimmed}$`, 'i') },
          });
          if (caseInsensitiveProjects.length > 0) {
            console.log(
              `⚠️ Found ${caseInsensitiveProjects.length} project(s) with case-insensitive match. Consider updating project/chat names to match exactly.`
            );
          }
        }
      } catch (projectError) {
        console.error('❌ Error removing user from project:', projectError);
        console.error('   Error details:', projectError.message);
        console.error('   Stack:', projectError.stack);
        // Continue even if project update fails
      }
    } else {
      console.log(`ℹ️ Not a group chat or no chat name, skipping project update`);
    }

    res.status(200).send({
      success: true,
      message: 'User removed from group!',
      chat: updatedChat,
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
      return res.status(400).send({
        success: false,
        message: 'User id is required!',
      });
    }

    // Get the chat to check if it's a group chat and get the chat name
    const existingChat = await chatModel.findById(chatId);
    if (!existingChat) {
      return res.status(404).send({
        success: false,
        message: 'Chat not found!',
      });
    }

    // Convert userId to ObjectId if it's a string
    let userIdObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObjectId = new mongoose.Types.ObjectId(userId);
    }

    // Add user to group chat
    const chat = await chatModel
      .findByIdAndUpdate({ _id: chatId }, { $addToSet: { users: userIdObjectId } }, { new: true })
      .populate('users', '-password ')
      .populate('groupAdmin', '-password ');

    // If it's a group chat, also add user to associated project (matching by name)
    if (existingChat.isGroupChat && existingChat.chatName) {
      try {
        // Trim and match project name (case-sensitive exact match)
        const chatNameTrimmed = existingChat.chatName.trim();

        const updateResult = await projectModel.updateMany(
          { name: chatNameTrimmed },
          { $addToSet: { employees: userIdObjectId } }
        );
        console.log(
          `✅ Added user ${userId} to ${updateResult.modifiedCount} project(s) with name "${chatNameTrimmed}"`
        );
      } catch (projectError) {
        console.error('❌ Error adding user to project:', projectError);
        // Continue even if project update fails
      }
    }

    res.status(200).send({
      success: true,
      message: 'User added to group!',
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
