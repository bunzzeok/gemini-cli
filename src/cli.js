import readline from "readline";
import dotenv from "dotenv";
import { prompts } from "./config/prompts.js";
import path from "path";
import { fileURLToPath } from "url";
import { handleCommand } from "./commands/handler.js";
import { ChatService } from "./services/chat.js";
import { startLoading, stopLoading, showWelcomeMessage, showError } from "./utils/ui.js";
import { GoogleGenAI } from "@google/genai";
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd(); // 현재 작업 디렉토리를 루트로 사용
const envPath = path.join(path.resolve(__dirname, ".."), ".env");

// .env 파일 로드
dotenv.config({ path: envPath });

if (!process.env.GEMINI_API_KEY) {
  console.error("Gemini API 키가 설정되지 않았습니다.");
  console.error("https://makersuite.google.com/app/apikey 에서 API 키를 발급받아 .env 파일에 설정해주세요.");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chatService = new ChatService(process.env.GEMINI_API_KEY, prompts);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


// 모든 비즈니스 로직은 서비스 계층으로 이동됨

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
      let isCommand = false;
      try {
        isCommand = await handleCommand(input, genAI, prompts, rootDir);
      } catch (commandError) {
        console.error(chalk.red(`명령어 처리 중 오류: ${commandError.message}`));
        stopLoading();
        askQuestion();
        return;
      }
      
      if (isCommand) {
        stopLoading();
        askQuestion();
        return;
      }

      // 채팅 서비스를 통한 메시지 처리
      const response = await chatService.sendMessage(input);
      stopLoading();
      console.log("\n답변:", response, "\n");
    } catch (error) {
      stopLoading();
      showError("오류가 발생했습니다", error);
    }

    askQuestion();
  });
}

// 애플리케이션 시작
function startApp() {
  showWelcomeMessage();
  
  const args = process.argv.slice(2);
  if (args.length > 0) {
    // 단일 명령어 모드
    handleSingleCommand(args.join(" "));
  } else {
    // 대화형 모드
    askQuestion();
  }
}

// 단일 명령어 처리
async function handleSingleCommand(message) {
  try {
    startLoading();
    
    // 명령어 처리 먼저 시도
    let isCommand = false;
    try {
      isCommand = await handleCommand(message, genAI, prompts, rootDir);
    } catch (commandError) {
      console.error(chalk.red(`명령어 처리 중 오류: ${commandError.message}`));
    }
    
    if (!isCommand) {
      // 명령어가 아니면 채팅 서비스로 처리
      const response = await chatService.sendSingleMessage(message);
      stopLoading();
      console.log(response);
    } else {
      stopLoading();
    }
  } catch (error) {
    stopLoading();
    showError("오류가 발생했습니다", error);
  }
  process.exit(0);
}

// 애플리케이션 시작
startApp();
