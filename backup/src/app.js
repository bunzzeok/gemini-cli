import express from "express";
import dotenv from "dotenv";
import geminiRoutes from "./routes/gemini.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Express 미들웨어 설정: JSON 파싱
app.use(express.json());

// 라우트 설정: Gemini API
app.use("/api/gemini", geminiRoutes);

// 기본 라우트: 서버 상태 확인
app.get("/", (req, res) => {
  res.json({ message: "Gemini API Server is running" });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 포트 ${port} 에서 실행 중입니다.`);
});