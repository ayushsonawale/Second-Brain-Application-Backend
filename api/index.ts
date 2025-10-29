import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Backend is live 🚀" });
});

app.post("/api/register", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  // logic to create user
  res.json({ message: "User created successfully", user: { email } });
});

export default app;
