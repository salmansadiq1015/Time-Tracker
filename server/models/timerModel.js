import mongoose from 'mongoose';

const timerModelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
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
      photos: [{ type: String }],
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
      photos: [{ type: String }],
    },
    durationMinutes: { type: Number, default: 0 },
    description: {
      type: String,
    },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'paused', 'approved', 'flagged', 'archived', 'pending'],
      default: 'active',
      index: true,
    },
    paused: {
      type: Boolean,
      default: false,
    },
    pausedAt: {
      type: Date,
    },
    pausedDuration: {
      type: Number,
      default: 0,
    },
    pausePeriods: [
      {
        pausedAt: { type: Date, required: true },
        resumedAt: { type: Date },
        duration: { type: Number, default: 0 },
      },
    ],
    verifiedByClient: { type: Boolean, default: false },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

timerModelSchema.pre('save', function (next) {
  if (this.startAt && this.endAt) {
    this.durationMinutes = Math.round((this.endAt - this.startAt) / (60 * 1000));
  }
  next();
});

timerModelSchema.index({ project: 1, startAt: 1 });
timerModelSchema.index({ employee: 1, startAt: 1 });

export default mongoose.model('timer', timerModelSchema);
