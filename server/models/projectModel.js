import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    // client: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'users',
    //   required: false,
    //   index: false,
    // },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip: {
      type: String,
    },
    description: String,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  },
  { timestamps: true }
);

// text index for quick search
projectSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Project', projectSchema);
