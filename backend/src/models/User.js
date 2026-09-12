import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,      // no two users can share an email
      lowercase: true,   // store emails in lowercase for consistent lookups
      trim: true,
    },
    passwordHash: { type: String }, // optional — Google users have none
    googleId: { type: String, unique: true, sparse: true }, // set only for Google users
  },
  { timestamps: true }   // auto-adds createdAt and updatedAt fields
);

export default mongoose.model("User", userSchema);