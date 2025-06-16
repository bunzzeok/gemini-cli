#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = resolve(__dirname, "../src/cli.js");

// 명령어 인자 가져오기
const args = process.argv.slice(2);

// CLI 스크립트 실행
const child = spawn("node", [cliPath, ...args], {
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("오류가 발생했습니다:", error.message);
  process.exit(1);
});
