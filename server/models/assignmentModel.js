import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
