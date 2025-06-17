#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

async function checkAndSetupToken() {
  try {
    // .env 파일이 이미 존재하는지 확인
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      if (envContent.includes("GEMINI_API_KEY=")) {
        console.log("이미 Gemini API 키가 설정되어 있습니다.");
        return;
      }
    }

    console.log("\nGemini CLI 설치를 시작합니다.");
    console.log(
      "Gemini API 키가 필요합니다. https://makersuite.google.com/app/apikey 에서 발급받을 수 있습니다.\n"
    );

    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Gemini API 키를 입력하세요:',
        validate: function(input) {
          if (!input) {
            return 'API 키를 입력해주세요.';
          }
          return true;
        }
      }
    ]);

    // .env 파일 생성 또는 업데이트
    const envContent = `GEMINI_API_KEY=${apiKey}\n`;
    fs.writeFileSync(envPath, envContent, { encoding: 'utf8' });
    console.log("\nAPI 키가 성공적으로 저장되었습니다!");
  } catch (error) {
    console.error("설정 중 오류가 발생했습니다:", error.message);
    process.exit(1);
  }
}

checkAndSetupToken().catch((error) => {
  console.error("예기치 않은 오류가 발생했습니다:", error);
  process.exit(1);
}); 