#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { platform } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");
const cliPath = resolve(rootDir, "src/cli.js");

// 명령어 인자 가져오기
const args = process.argv.slice(2);

// 운영체제에 따라 node 실행 경로 설정
const nodePath = platform() === 'win32' ? 'node.exe' : 'node';

// NODE_PATH 환경변수 설정
const nodePathEnv = process.env.NODE_PATH || '';
const newPath = `${rootDir}/node_modules${nodePathEnv ? ':' + nodePathEnv : ''}`;

// CLI 스크립트 실행
const child = spawn(nodePath, [cliPath, ...args], {
  stdio: "inherit",
  shell: platform() === 'win32',
  env: {
    ...process.env,
    NODE_PATH: newPath
  }
});

child.on("error", (error) => {
  console.error("오류가 발생했습니다:", error.message);
  process.exit(1);
});
