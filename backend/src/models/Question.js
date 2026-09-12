import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["technical", "behavioral", "system_design", "situational"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    order: { type: Number, required: true }, // 1..8, to display in order
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);