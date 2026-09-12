import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    // Which user owns this session. Indexed because we always query by user.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    jobDescription: { type: String, required: true },

    // The state machine: pending → generating → ready → in_progress → completed
    status: {
      type: String,
      enum: ["pending", "generating", "ready", "in_progress", "completed"],
      default: "pending",
    },
    questionCount: { type: Number, default: 8 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);