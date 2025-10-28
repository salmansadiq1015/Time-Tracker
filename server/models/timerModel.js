import mongoose from "mongoose";

const timerModelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    start: {
      startTime: {
        type: Date,
        required: true,
      },
      location: {
        type: String,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    end: {
      endTime: {
        type: Date,
        required: false,
      },
      location: {
        type: String,
      },
      lat: {
        type: Number,
        required: false,
      },
      lng: {
        type: Number,
        required: false,
      },
    },
    description: {
      type: String,
    },
    duration: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("timer", timerModelSchema);
