import express from "express";
import dotenv from "dotenv";
import geminiRoutes from "./routes/gemini.routes.js";
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 필수 환경 변수 확인
const requiredEnvVariables = ['API_KEY']; // 필요한 환경 변수 목록
for (const envVar of requiredEnvVariables) {
  if (!process.env[envVar]) {
    console.error(`필수 환경 변수 누락: ${envVar}`);
    process.exit(1); // 애플리케이션 종료
  }
}

// Express 미들웨어 설정: JSON 파싱
app.use(express.json());

// CORS 미들웨어 설정: 모든 도메인 허용
app.use(cors());

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