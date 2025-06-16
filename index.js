import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chatWithGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error:", error.message);
    return "죄송합니다. 오류가 발생했습니다.";
  }
}

console.log(
  'Gemini CLI에 오신 것을 환영합니다! (종료하려면 "exit" 또는 "quit"를 입력하세요)'
);

function askQuestion() {
  rl.question("gemini ", async (input) => {
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log("프로그램을 종료합니다.");
      rl.close();
      return;
    }

    const response = await chatWithGemini(input);
    console.log("\n답변:", response, "\n");
    askQuestion();
  });
}

askQuestion();
