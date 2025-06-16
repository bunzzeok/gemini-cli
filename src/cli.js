import readline from "readline";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { prompts } from "./config/prompts.js";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 채팅 세션 저장
let chat = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 로딩 애니메이션
const loadingChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let loadingInterval;

function startLoading() {
  let i = 0;
  loadingInterval = setInterval(() => {
    process.stdout.write(`\r${loadingChars[i]} Gemini가 생각중입니다...`);
    i = (i + 1) % loadingChars.length;
  }, 100);
}

function stopLoading() {
  clearInterval(loadingInterval);
  process.stdout.write("\r" + " ".repeat(50) + "\r"); // 로딩 텍스트 지우기
}

console.log(
  'Gemini CLI에 오신 것을 환영합니다! (종료하려면 "exit" 또는 "quit"를 입력하세요)'
);

async function askQuestion() {
  rl.question("> ", async (input) => {
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log("프로그램을 종료합니다.");
      rl.close();
      return;
    }

    try {
      startLoading();

      // 첫 대화인 경우에만 새로운 채팅 세션 생성
      if (!chat) {
        chat = genAI.chats.create({
          model: "gemini-2.0-flash-lite",
          config: {
            systemInstruction: prompts.chat,
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                action: { type: "STRING" },
                text: { type: "STRING" },
              },
              required: ["action", "text"],
              propertyOrdering: ["action", "text"],
            },
          },
        });
      }

      // 메시지를 객체로 감싸서 전송
      const result = await chat.sendMessage({ message: input });
      const response = result.candidates[0].content.parts[0].text;

      stopLoading();

      try {
        // JSON 응답 파싱
        const parsedResponse = JSON.parse(response);
        console.log("\n답변:", parsedResponse.text, "\n");
      } catch (error) {
        console.error("응답 파싱 오류:", error.message);
        console.log("\n답변:", response, "\n");
      }
    } catch (error) {
      stopLoading();
      console.error("오류가 발생했습니다:", error.message);
    }

    askQuestion();
  });
}

// 명령어 인자 확인
const args = process.argv.slice(2);
if (args.length > 0) {
  // 인자가 있으면 한 번만 실행
  const message = args.join(" ");
  try {
    startLoading();
    const singleChat = genAI.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: prompts.chat,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            action: { type: "STRING" },
            text: { type: "STRING" },
          },
          required: ["action", "text"],
          propertyOrdering: ["action", "text"],
        },
      },
    });

    const result = await singleChat.sendMessage({ message });
    const response = result.candidates[0].content.parts[0].text;

    stopLoading();

    try {
      const parsedResponse = JSON.parse(response);
      console.log(parsedResponse.text);
    } catch (error) {
      console.log(response);
    }
  } catch (error) {
    stopLoading();
    console.error("오류가 발생했습니다:", error.message);
  }
  process.exit(0);
} else {
  // 인자가 없으면 대화형 모드로 실행
  askQuestion();
}
