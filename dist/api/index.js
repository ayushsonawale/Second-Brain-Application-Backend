"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("../src/db");
const middleware_1 = require("../src/middleware");
const hashCreate_1 = require("../src/hashCreate");
const config_1 = require("../src/config");
const app = (0, express_1.default)();
// ====== Middleware ======
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ====== MongoDB Connection ======
mongoose_1.default
    .connect(config_1.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
// ====== Routes ======
// --- Signup ---
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        yield db_1.userModel.create({ username, password });
        res.json({ message: "User signed up successfully ✅" });
    }
    catch (e) {
        res.status(411).json({ message: "User already exists ❌" });
    }
}));
// --- Signin ---
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const existingUser = yield db_1.userModel.findOne({ username, password });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, config_1.JWT_PASSWORD);
        res.json({ token });
    }
    else {
        res.status(403).json({ message: "Incorrect credentials ❌" });
    }
}));
// --- Add Content ---
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title } = req.body;
    yield db_1.contentModel.create({
        link,
        type,
        title,
        // @ts-ignore
        userId: req.userId,
        tags: [],
    });
    res.json({ message: "Content added ✅" });
}));
// --- Get All Content ---
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const content = yield db_1.contentModel
        .find({ userId })
        .populate("userId", "username");
    res.json({ content });
}));
// --- Delete Content ---
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contentId } = req.body;
    yield db_1.contentModel.deleteMany({
        _id: contentId,
        // @ts-ignore
        userId: req.userId,
    });
    res.json({ message: "Content deleted ✅" });
}));
// --- Share Brain ---
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (share) {
        const existingLink = yield db_1.linkModel.findOne({
            // @ts-ignore
            userId: req.userId,
        });
        if (existingLink) {
            return res.json({ hash: existingLink.hash });
        }
        const hash = (0, hashCreate_1.randomHashCreate)(10);
        yield db_1.linkModel.create({
            // @ts-ignore
            userId: req.userId,
            hash,
        });
        res.json({ hash });
    }
    else {
        yield db_1.linkModel.deleteOne({
            // @ts-ignore
            userId: req.userId,
        });
        res.json({ message: "Removed shared link ❌" });
    }
}));
// --- Get Shared Brain by Hash ---
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.linkModel.findOne({ hash });
    if (!link) {
        return res.status(411).json({ message: "Invalid share link ❌" });
    }
    const content = yield db_1.contentModel.find({
        // @ts-ignore
        userId: link.userId,
    });
    const user = yield db_1.userModel.findOne({
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
}));
// ====== Server or Export for Vercel ======
if (process.env.NODE_ENV !== "production") {
    app.listen(3000, () => console.log("🚀 Server running locally at http://localhost:3000"));
}
exports.default = app;
