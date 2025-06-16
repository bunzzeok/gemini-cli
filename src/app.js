import express from "express";
import dotenv from "dotenv";
import geminiRoutes from "./routes/gemini.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 라우트 설정
app.use("/api/gemini", geminiRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ message: "Gemini API Server is running" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
