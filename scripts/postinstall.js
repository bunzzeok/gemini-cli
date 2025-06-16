import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { platform } from "os";
import { createInterface } from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

async function setupToken() {
  try {
    // .env 파일이 이미 존재하는지 확인
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      if (envContent.includes("GEMINI_API_KEY=")) {
        console.log("이미 Gemini API 키가 설정되어 있습니다.");
        return;
      }
    }

    console.log("\nGemini CLI 초기 설정을 시작합니다.");
    console.log(
      "Gemini API 키가 필요합니다. https://makersuite.google.com/app/apikey 에서 발급받을 수 있습니다.\n"
    );

    // readline 인터페이스 생성
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Promise로 감싸서 사용자 입력 받기
    const apiKey = await new Promise((resolve) => {
      rl.question('Gemini API 키를 입력하세요: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });

    if (!apiKey) {
      console.error("API 키를 입력해주세요.");
      process.exit(1);
    }

    // .env 파일 생성 또는 업데이트
    const envContent = `GEMINI_API_KEY=${apiKey}\n`;
    fs.writeFileSync(envPath, envContent, { encoding: 'utf8' });
    console.log("\nAPI 키가 성공적으로 저장되었습니다!");
    console.log("이제 `gemini` 명령어를 사용할 수 있습니다.");
  } catch (error) {
    console.error("설정 중 오류가 발생했습니다:", error.message);
    process.exit(1);
  }
}

setupToken().catch((error) => {
  console.error("예기치 않은 오류가 발생했습니다:", error);
  process.exit(1);
});
