import readline from "readline";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { prompts } from "./config/prompts.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import chalk from "chalk";
import { handleCommand } from "./commands/handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

// .env 파일 로드
dotenv.config({ path: envPath });

if (!process.env.GEMINI_API_KEY) {
  console.error("Gemini API 키가 설정되지 않았습니다.");
  console.error("https://makersuite.google.com/app/apikey 에서 API 키를 발급받아 .env 파일에 설정해주세요.");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 채팅 세션 저장
let chat = null;
// 프로젝트 분석 결과 저장
let projectAnalysis = null;

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

// 프로젝트 파일 구조 분석 함수
function analyzeProjectStructure() {
  const files = [];
  const processedPaths = new Set();
  const excludeDirs = ['node_modules', '.git', 'backup', 'dist', 'build'];
  const excludeFiles = ['.log', '.backup', '.lock', '.map'];
  
  // 현재 작업 디렉토리 사용
  const currentDir = process.cwd();
  console.log(chalk.blue(`\n현재 작업 디렉토리: ${currentDir}\n`));
  
  function scanDirectory(dir, relativePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item);
        
        // 이미 처리된 경로는 건너뛰기
        if (processedPaths.has(relPath)) {
          return;
        }
        processedPaths.add(relPath);
        
        try {
          const stats = fs.statSync(fullPath);
          
          // 심볼릭 링크 건너뛰기
          if (stats.isSymbolicLink()) {
            return;
          }
          
          if (stats.isDirectory()) {
            // 제외할 디렉토리 건너뛰기
            if (excludeDirs.includes(item)) {
              return;
            }
            scanDirectory(fullPath, relPath);
          } else if (stats.isFile()) {
            // 제외할 파일 건너뛰기
            if (excludeFiles.some(ext => item.endsWith(ext))) {
              return;
            }
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              files.push({
                path: relPath,
                type: 'file',
                content: content.substring(0, 1000) // 최대 1000자만 저장
              });
            } catch (error) {
              files.push({
                path: relPath,
                type: 'file',
                error: `파일 읽기 오류: ${error.message}`
              });
            }
          }
        } catch (error) {
          files.push({
            path: relPath,
            type: 'error',
            error: `접근 오류: ${error.message}`
          });
        }
      });
    } catch (error) {
      files.push({
        path: relativePath,
        type: 'error',
        error: `디렉토리 읽기 오류: ${error.message}`
      });
    }
  }
  
  scanDirectory(currentDir);
  return files;
}

// 분석 결과 포맷팅 함수
function formatAnalysisResult(analysis) {
  try {
    // JSON 형식이 아닌 경우 직접 텍스트 처리
    let text = analysis;
    if (analysis.includes('```json')) {
      const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1];
        try {
          const result = JSON.parse(jsonStr);
          if (result.text) {
            text = result.text;
          }
        } catch (e) {
          console.error('JSON 파싱 오류:', e);
        }
      }
    }

    let formattedOutput = chalk.green('\n✨ 분석 결과: ✨\n\n');
    
    // 섹션별로 분리
    const sections = text.split('\n\n');
    
    sections.forEach(section => {
      if (section.trim()) {
        // 섹션 제목 찾기
        const titleMatch = section.match(/^\*\*([^*]+)\*\*:/);
        if (titleMatch) {
          const title = titleMatch[1].trim();
          const content = section.substring(titleMatch[0].length).trim();
          
          // 제목 스타일링
          formattedOutput += chalk.cyan(`📌 ${title}\n`);
          formattedOutput += chalk.cyan('─'.repeat(50) + '\n');
          
          // 내용 포맷팅
          if (content.includes('*   ')) {
            // 리스트 항목인 경우
            const items = content.split('*   ').filter(item => item.trim());
            items.forEach(item => {
              // 리스트 항목 내의 볼드 처리
              const formattedItem = item.replace(/\*\*([^*]+)\*\*/g, chalk.bold('$1'));
              formattedOutput += chalk.yellow('• ') + formattedItem.trim() + '\n';
            });
          } else {
            // 일반 텍스트인 경우
            formattedOutput += content + '\n';
          }
          formattedOutput += '\n';
        } else {
          // 제목이 없는 섹션
          formattedOutput += section + '\n\n';
        }
      }
    });

    return formattedOutput;
  } catch (error) {
    console.error('포맷팅 중 오류 발생:', error);
    return analysis;
  }
}

// 프로젝트 전체 분석 함수
async function analyzeProject() {
  try {
    console.log(chalk.blue('\n프로젝트 분석을 시작합니다...\n'));
    const projectFiles = analyzeProjectStructure();
    
    if (projectFiles.length === 0) {
      throw new Error('분석할 파일을 찾을 수 없습니다.');
    }

    console.log(chalk.blue(`\n총 ${projectFiles.length}개의 파일을 분석합니다...\n`));
    
    const analysisChat = genAI.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: prompts.codeAnalysis,
        temperature: 0.7,
      },
    });

    const result = await analysisChat.sendMessage({
      message: `다음 프로젝트의 파일들을 분석해주세요. 각 파일의 내용은 최대 1000자로 제한되어 있습니다:\n\n${JSON.stringify(projectFiles, null, 2)}`,
    });

    projectAnalysis = result.candidates[0].content.parts[0].text;
    console.log(chalk.green('\n✨ 분석 결과: ✨\n'));
    console.log(formatAnalysisResult(projectAnalysis));
    console.log(chalk.green('\n------------------------------------\n'));
    return projectAnalysis;
  } catch (error) {
    throw new Error(`프로젝트 분석 중 오류 발생: ${error.message}`);
  }
}

// 백업 디렉토리 생성 함수
function ensureBackupDirectory(filePath) {
  const backupDir = path.join(rootDir, 'backup');
  const relativePath = path.relative(rootDir, filePath);
  const backupPath = path.join(backupDir, relativePath);
  const backupDirPath = path.dirname(backupPath);

  // backup 디렉토리가 없으면 생성
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 백업 파일의 디렉토리 구조 생성
  if (!fs.existsSync(backupDirPath)) {
    fs.mkdirSync(backupDirPath, { recursive: true });
  }

  return backupPath;
}

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
    if (!projectAnalysis) {
      console.log(chalk.yellow('\n프로젝트 분석이 필요합니다. 분석을 시작합니다...\n'));
      await analyzeProject();
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const modificationChat = genAI.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: prompts.codeModification,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            code: { type: "STRING" },
            explanation: { type: "STRING" }
          },
          required: ["code", "explanation"]
        }
      }
    });

    const result = await modificationChat.sendMessage({
      message: `프로젝트 분석 결과:\n${projectAnalysis}\n\n수정할 파일 경로: ${filePath}\n\n원본 코드:\n${content}\n\n수정 요청: ${modificationRequest}\n\n수정된 코드를 code 필드에, 수정 내용에 대한 설명을 explanation 필드에 JSON 형식으로 응답해주세요.`
    });

    const response = JSON.parse(result.candidates[0].content.parts[0].text);
    
    // 백업 파일 경로 생성 및 저장
    const backupPath = ensureBackupDirectory(filePath);
    fs.writeFileSync(backupPath, content);
    console.log(chalk.yellow(`\n원본 파일이 ${backupPath}에 백업되었습니다.`));

    // 수정된 코드를 파일에 저장
    fs.writeFileSync(filePath, response.code);
    console.log(chalk.green('\n✨ 파일이 성공적으로 수정되었습니다. ✨\n'));
    
    return response.explanation;
  } catch (error) {
    throw new Error(`코드 수정 중 오류 발생: ${error.message}`);
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
        if (parsedResponse && parsedResponse.text) {
          console.log("\n답변:", parsedResponse.text, "\n");
        } else {
          console.log("\n답변:", response, "\n");
        }
      } catch (parseError) {
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
      if (parsedResponse && parsedResponse.text) {
        console.log(parsedResponse.text);
      } else {
        console.log(response);
      }
    } catch (parseError) {
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
