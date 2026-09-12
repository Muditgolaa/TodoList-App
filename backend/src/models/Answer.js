import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, required: true },

    // null until the AI grades it
    score: { type: Number, min: 0, max: 100, default: null },
    feedback: { type: String, default: null },
    timeSpentSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Answer", answerSchema);