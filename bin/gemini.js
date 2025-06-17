#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { platform } from "os";
import fs from "fs";
import dotenv from "dotenv";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");
const cliPath = resolve(rootDir, "src/cli.js");
const envPath = resolve(rootDir, ".env");

async function setupToken() {
  try {
    console.log("\nGemini CLI 설정을 시작합니다.");
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
    return true;
  } catch (error) {
    console.error("설정 중 오류가 발생했습니다:", error.message);
    return false;
  }
}

async function main() {
  // .env 파일 로드
  dotenv.config({ path: envPath });

  // API 키 확인
  if (!process.env.GEMINI_API_KEY) {
    console.log("Gemini API 키가 설정되지 않았습니다.");
    const success = await setupToken();
    if (!success) {
      process.exit(1);
    }
    // .env 파일 다시 로드
    dotenv.config({ path: envPath });
  }

  // CLI 실행
  const nodePath = platform() === 'win32' ? 'node.exe' : 'node';
  const cliProcess = spawn(nodePath, [cliPath], {
    stdio: "inherit",
    shell: true
  });
}

main().catch((error) => {
  console.error("예기치 않은 오류가 발생했습니다:", error);
  process.exit(1);
});
