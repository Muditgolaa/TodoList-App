import mongoose from "mongoose";

// Connects to MongoDB Atlas using the URI from your .env file.
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // skip if no real URI yet
  if (!uri || uri.startsWith("your_")) {
    console.log("⚠️  No MONGODB_URI set yet — skipping DB connection for now.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);   // fail loud — don't run a server that can't reach the DB
  }
}