import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

// Helper: create a signed JWT that proves who the user is, valid for 7 days.
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    const cleanEmail = email.toLowerCase().trim();

    if (!name || !cleanEmail || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: cleanEmail, passwordHash });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET /api/auth/me  — protected: returns the currently logged-in user
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("name email createdAt");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// POST /api/auth/google — verify Google's ID token, find-or-create user, issue OUR JWT
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential" });
    }

    // Verify token really came from Google AND was issued on app.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // { sub, email, name}
    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];

    // Find by googleId → else by email → else create.
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId; // existing user links Google
        await user.save();
      } else {
        user = await User.create({ name, email, googleId });
      }
    }

    // Still issue JWT — the rest of the app unchanged.
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ error: "Google sign-in failed" });
  }
});

export default router;