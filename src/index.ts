import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

import { contentModel, linkModel, userModel } from "./db";
import { userMiddleware } from "./middleware";
import { randomHashCreate } from "./hashCreate";
import { JWT_PASSWORD, MONGO_URI } from "./config";

dotenv.config();

const app = express();

// ====== Middleware ======
app.use(cors());
app.use(express.json());

// ====== MongoDB Connection ======
mongoose
  .connect(MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====== Routes ======

// --- Signup ---
app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    await userModel.create({ username, password });
    res.json({ message: "User signed up successfully ✅" });
  } catch (e) {
    res.status(411).json({ message: "User already exists ❌" });
  }
});

// --- Signin ---
app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await userModel.findOne({ username, password });
  if (existingUser) {
    const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);
    res.json({ token });
  } else {
    res.status(403).json({ message: "Incorrect credentials ❌" });
  }
});

// --- Add Content ---
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const { link, type, title } = req.body;

  await contentModel.create({
    link,
    type,
    title,
    // @ts-ignore
    userId: req.userId,
    tags: [],
  });

  res.json({ message: "Content added ✅" });
});

// --- Get All Content ---
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;

  const content = await contentModel
    .find({ userId })
    .populate("userId", "username");

  res.json({ content });
});

// --- Delete Content ---
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const { contentId } = req.body;

  await contentModel.deleteMany({
    _id: contentId,
    // @ts-ignore
    userId: req.userId,
  });

  res.json({ message: "Content deleted ✅" });
});

// --- Share Brain ---
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body;

  if (share) {
    const existingLink = await linkModel.findOne({
      // @ts-ignore
      userId: req.userId,
    });

    if (existingLink) {
      return res.json({ hash: existingLink.hash });
    }

    const hash = randomHashCreate(10);
    await linkModel.create({
      // @ts-ignore
      userId: req.userId,
      hash,
    });

    res.json({ hash });
  } else {
    await linkModel.deleteOne({
      // @ts-ignore
      userId: req.userId,
    });

    res.json({ message: "Removed shared link ❌" });
  }
});

// --- Get Shared Brain by Hash ---
app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await linkModel.findOne({ hash });
  if (!link) {
    return res.status(411).json({ message: "Invalid share link ❌" });
  }

  const content = await contentModel.find({
    // @ts-ignore
    userId: link.userId,
  });

  const user = await userModel.findOne({
    // @ts-ignore
    _id: link.userId,
  });

  if (!user) {
    return res.status(411).json({ message: "User not found ❌" });
  }

  res.json({
    username: user.username,
    content,
  });
});

// ====== Server or Export for Vercel ======
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () =>
    console.log("🚀 Server running locally at http://localhost:3000")
  );
}

export default app;
