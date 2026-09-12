import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { generateQuestions } from "../lib/ai.js";
import Session from "../models/Session.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

const router = express.Router();

// Every route below requires a valid token.
router.use(requireAuth);

// POST /api/sessions  — create a new session (status: pending)
router.post("/", async (req, res) => {
  try {
    const { jobTitle, company, jobDescription } = req.body;
    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: "jobTitle and jobDescription are required" });
    }
    const session = await Session.create({
      userId: req.userId,
      jobTitle,
      company,
      jobDescription,
    });
    res.status(201).json({ session });
  } catch (err) {
    console.error("Create session error:", err.message);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// GET /api/sessions  — list my sessions, newest first
router.get("/", async (req, res) => {
  const sessions = await Session.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ sessions });
});

// GET /api/sessions/:id  — one session (the frontend polls this while generating)
router.get("/:id", async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json({ session });
});

// POST /api/sessions/:id/generate  — Groq generates + saves 8 questions  [rate limited]
router.post("/:id/generate", aiLimiter, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.userId });
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Don't regenerate (and don't double-charge Groq).
    if (session.status !== "pending") {
      return res.status(400).json({ error: "Questions already generated" });
    }

    session.status = "generating";
    await session.save();

    const generated = await generateQuestions({
      jobTitle: session.jobTitle,
      company: session.company,
      jobDescription: session.jobDescription,
    });

    // Save each question with its display order (1..8).
    const docs = generated.map((q, i) => ({
      sessionId: session._id,
      content: q.content,
      category: q.category,
      difficulty: q.difficulty,
      order: i + 1,
    }));
    const questions = await Question.insertMany(docs);

    session.status = "ready";
    await session.save();

    res.json({ status: session.status, questions });
  } catch (err) {
    console.error("Generate error:", err.message);
    // Roll the status back so the user can retry.
    await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status: "pending" }
    );
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// GET /api/sessions/:id/questions  — the 8 questions, in order
router.get("/:id/questions", async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) return res.status(404).json({ error: "Session not found" });
  const questions = await Question.find({ sessionId: session._id }).sort({ order: 1 });
  res.json({ questions });
});

// GET /api/sessions/:id/report  — full graded session: questions + answers + stats
router.get("/:id/report", async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) return res.status(404).json({ error: "Session not found" });

  const questions = await Question.find({ sessionId: session._id }).sort({ order: 1 });
  const answers = await Answer.find({ sessionId: session._id });

  // Pair each question with its answer (or null if unanswered).
  const items = questions.map((q) => {
    const answer = answers.find(
      (a) => a.questionId.toString() === q._id.toString()
    );
    return { question: q, answer: answer || null };
  });

  // Average score across graded answers.
  const scored = answers.filter((a) => a.score !== null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, a) => sum + a.score, 0) / scored.length)
    : null;

  res.json({
    session,
    items,
    stats: { answered: answers.length, total: session.questionCount, avgScore },
  });
});

// DELETE /api/sessions/:id  — delete a session and its questions + answers
router.delete("/:id", async (req, res) => {
  const session = await Session.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!session) return res.status(404).json({ error: "Session not found" });
  await Question.deleteMany({ sessionId: session._id });
  await Answer.deleteMany({ sessionId: session._id });
  res.json({ message: "Session deleted" });
});

export default router;