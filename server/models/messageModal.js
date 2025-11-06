import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    content: {
      type: String,
      trim: true,
    },
    contentType: {
      type: String,
      default: 'text',
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    reactions: [
      {
        emoji: { type: String },
        userIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Messages', messageSchema);
