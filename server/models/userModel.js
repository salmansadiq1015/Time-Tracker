import mongoose from "mongoose";

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
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'dispatcher', 'client', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

export default mongoose.model('users', userSchema);