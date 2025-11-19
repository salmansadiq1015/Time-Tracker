import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    serial: {
      type: String,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    status: {
      type: String,
      enum: ["available", "assigned", "maintenance"],
      default: "available",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    assignDate: {
        type:Date,
        default:new Date()
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

export default mongoose.model("Equipment", equipmentSchema);
