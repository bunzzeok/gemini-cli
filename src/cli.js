import readline from "readline";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { prompts } from "./config/prompts.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

// .env 파일 로드
dotenv.config({ path: envPath });

if (!process.env.GEMINI_API_KEY) {
  console.error("Gemini API 키가 설정되지 않았습니다.");
  console.error("https://makersuite.google.com/app/apikey 에서 API 키를 발급받아 .env 파일에 설정해주세요.");
  process.exitㅜ
}

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

// 코드 분석 함수
async function analyzeCode(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const analysisChat = genAI.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: prompts.codeAnalysis,
        temperature: 0.7,
      },
    });

    const result = await analysisChat.sendMessage({
      message: `다음 코드를 분석해주세요:\n\n${content}`,
    });
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(`코드 분석 중 오류 발생: ${error.message}`);
  }
}

// 코드 수정 함수
async function modifyCode(filePath, modificationRequest) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const modificationChat = genAI.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: prompts.codeModification,
        temperature: 0.7,
      },
    });

    const result = await modificationChat.sendMessage({
      message: `다음 코드를 수정해주세요:\n\n원본 코드:\n${content}\n\n수정 요청: ${modificationRequest}`,
    });
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(`코드 수정 중 오류 발생: ${error.message}`);
  }
}

// 명령어 처리 함수
async function handleCommand(input) {
  try {
    const commandChat = genAI.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: prompts.codeAnalysis,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            action: { type: "STRING", enum: ["analyze", "modify", "chat"] },
            filePath: { type: "STRING" },
            request: { type: "STRING" },
            text: { type: "STRING" }
          },
          required: ["action", "text"]
        }
      }
    });

    const result = await commandChat.sendMessage({ message: input });
    const response = JSON.parse(result.candidates[0].content.parts[0].text);

    switch (response.action) {
      case "analyze":
        if (!response.filePath) {
          console.log("파일 경로가 지정되지 않았습니다.");
          return true;
        }
        const filePath = path.resolve(process.cwd(), response.filePath);
        try {
          const analysis = await analyzeCode(filePath);
          console.log('\n분석 결과:', analysis, '\n');
        } catch (error) {
          console.error(error.message);
        }
        break;

      case "modify":
        if (!response.filePath || !response.request) {
          console.log("파일 경로나 수정 요청이 지정되지 않았습니다.");
          return true;
        }
        const targetPath = path.resolve(process.cwd(), response.filePath);
        try {
          const modification = await modifyCode(targetPath, response.request);
          console.log('\n수정 결과:', modification, '\n');
        } catch (error) {
          console.error(error.message);
        }
        break;

      case "chat":
        return false;
    }
    return true;
  } catch (error) {
    console.error("명령어 처리 중 오류 발생:", error.message);
    return false;
  }
}

async function askQuestion() {
  rl.question("> ", async (input) => {
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log("프로그램을 종료합니다.");
      rl.close();
      return;
    }

    try {
      startLoading();

      // 명령어 처리
      const isCommand = await handleCommand(input);
      if (isCommand) {
        stopLoading();
        askQuestion();
        return;
      }

      // 기존 채팅 로직
      if (!chat) {
        chat = genAI.chats.create({
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
