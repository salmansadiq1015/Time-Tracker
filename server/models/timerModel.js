import mongoose from "mongoose";

const timerModelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
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
    durationMinutes: { type: Number, default: 0 },
    description: {
      type: String,
    },
    photos: [{ type: String }],
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "approved", "flagged", "archived", "pending"],
      default: "active",
      index: true,
    },
    verifiedByClient: { type: Boolean, default: false },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

timerModelSchema.pre("save", function (next) {
  if (this.startAt && this.endAt) {
    this.durationMinutes = Math.round(
      (this.endAt - this.startAt) / (60 * 1000)
    );
  }
  next();
});

timerModelSchema.index({ project: 1, startAt: 1 });
timerModelSchema.index({ employee: 1, startAt: 1 });

export default mongoose.model("timer", timerModelSchema);
