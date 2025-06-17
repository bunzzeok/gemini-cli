#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const geminiPath = resolve(rootDir, 'bin/gemini.js');

try {
  if (platform() !== 'win32') {
    // Unix-like 시스템에서만 실행 권한 설정
    execSync(`chmod +x "${geminiPath}"`);
    console.log('실행 권한이 설정되었습니다.');
  }
} catch (error) {
  console.error('실행 권한 설정 중 오류가 발생했습니다:', error.message);
  process.exit(1);
} 