import dotenv from "dotenv";
dotenv.config();

export const JWT_PASSWORD = process.env.JWT_PASSWORD || "ayushsonawale";
export const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ayushsonawale:1234@cluster0.yjnym.mongodb.net/second_brain";
