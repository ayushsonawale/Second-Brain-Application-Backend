"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGO_URI = exports.JWT_PASSWORD = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.JWT_PASSWORD = process.env.JWT_PASSWORD || "ayushsonawale";
exports.MONGO_URI = process.env.MONGO_URI ||
    "mongodb+srv://ayushsonawale:1234@cluster0.yjnym.mongodb.net/second_brain";
