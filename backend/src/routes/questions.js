import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { evaluateAnswer } from "../lib/ai.js";
import Question from "../models/Question.js";
import Session from "../models/Session.js";
import Answer from "../models/Answer.js";

const router = express.Router();
router.use(requireAuth);

// POST /api/questions/:qid/answers  — submit an answer, Groq scores it  [rate limited]
router.post("/:qid/answers", aiLimiter, async (req, res) => {
  try {
    const { content, timeSpentSeconds } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Answer content is required" });
    }

    // Load the question, then confirm the user owns its session.
    const question = await Question.findById(req.params.qid);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const session = await Session.findOne({
      _id: question.sessionId,
      userId: req.userId,
    });
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Don't allow answering the same question twice.
    const existing = await Answer.findOne({
      questionId: question._id,
      userId: req.userId,
    });
    if (existing) {
      return res.status(400).json({ error: "Question already answered" });
    }

    // Score the answer with Groq.
    const { score, feedback } = await evaluateAnswer({
      question: question.content,
      answer: content,
    });

    // Save it.
    const answer = await Answer.create({
      questionId: question._id,
      sessionId: session._id,
      userId: req.userId,
      content,
      score,
      feedback,
      timeSpentSeconds: timeSpentSeconds || 0,
    });

    // First answer → session is now in progress.
    if (session.status === "ready") {
      session.status = "in_progress";
      await session.save();
    }

    // All questions answered → session complete.
    const answeredCount = await Answer.countDocuments({ sessionId: session._id });
    if (answeredCount >= session.questionCount) {
      session.status = "completed";
      session.completedAt = new Date();
      await session.save();
    }

    res.status(201).json({ answer, sessionStatus: session.status });
  } catch (err) {
    console.error("Answer error:", err.message);
    res.status(500).json({ error: "Failed to score answer" });
  }
});

export default router;