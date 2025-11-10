import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'dispatcher', 'client', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetTokenExpire: {
      type: Date,
      default: null,
    },
    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('users', userSchema);
