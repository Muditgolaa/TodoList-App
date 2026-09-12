import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import Answer from "../models/Answer.js";
import Session from "../models/Session.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/analytics  — aggregate stats for the logged-in user
router.get("/", async (req, res) => {
  try {
    // ! In aggregate(), Mongoose does NOT auto-cast strings to ObjectId — do it manually.
    const userId = new mongoose.Types.ObjectId(req.userId);

    // Score stats across all graded answers, computed in the DB.
    const [scoreStats] = await Answer.aggregate([
      { $match: { userId, score: { $ne: null } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          bestScore: { $max: "$score" },
          totalAnswered: { $sum: 1 },
        },
      },
    ]);

    // Session counts.
    const totalSessions = await Session.countDocuments({ userId });
    const completedSessions = await Session.countDocuments({
      userId,
      status: "completed",
    });

    res.json({
      avgScore: scoreStats ? Math.round(scoreStats.avgScore) : null,
      bestScore: scoreStats ? scoreStats.bestScore : null,
      totalAnswered: scoreStats ? scoreStats.totalAnswered : 0,
      totalSessions,
      completedSessions,
      completionRate: totalSessions
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0,
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

export default router;