import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { validateAndNormalizePath, isAllowedFileExtension, isFileSizeAllowed, sanitizeInput } from '../utils/security.js';

export function ensureBackupDirectory(rootDir) {
  const backupDir = path.join(rootDir, 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

/**
 * 백업 파일 목록 조회
 * @param {string} rootDir - 루트 디렉토리
 * @returns {Array} 백업 파일 목록
 */
export function listBackups(rootDir) {
  const backupDir = path.join(rootDir, 'backup');
  if (!fs.existsSync(backupDir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(backupDir);
    return files
      .filter(file => file.endsWith('.backup'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.mtime,
          originalFile: file.replace(/\.[^.]+\.backup$/, '')
        };
      })
      .sort((a, b) => b.created - a.created);
  } catch (error) {
    console.error(chalk.red(`백업 목록 조회 실패: ${error.message}`));
    return [];
  }
}

/**
 * 백업 파일 복원
 * @param {string} backupPath - 백업 파일 경로
 * @param {string} targetPath - 복원할 대상 파일 경로 (선택사항)
 * @returns {boolean} 복원 성공 여부
 */
export function restoreFromBackup(backupPath, targetPath = null) {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`백업 파일을 찾을 수 없습니다: ${backupPath}`);
    }

    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    
    // 대상 파일 경로가 지정되지 않은 경우 원본 파일명 추출
    if (!targetPath) {
      const backupFileName = path.basename(backupPath);
      const originalFileName = backupFileName.replace(/\.[^.]+\.backup$/, '');
      targetPath = path.join(process.cwd(), originalFileName);
    }

    // 현재 파일이 존재하면 추가 백업 생성
    if (fs.existsSync(targetPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const preRestoreBackup = path.join(path.dirname(backupPath), `${path.basename(targetPath)}.pre-restore-${timestamp}.backup`);
      fs.copyFileSync(targetPath, preRestoreBackup);
      console.log(chalk.yellow(`복원 전 현재 파일 백업: ${preRestoreBackup}`));
    }

    fs.writeFileSync(targetPath, backupContent);
    console.log(chalk.green(`✅ 백업 복원 완료: ${targetPath}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ 백업 복원 실패: ${error.message}`));
    return false;
  }
}

/**
 * 오래된 백업 파일 정리
 * @param {string} rootDir - 루트 디렉토리
 * @param {number} maxAge - 최대 보관 기간 (일)
 * @param {number} maxCount - 최대 백업 파일 수
 * @returns {number} 삭제된 파일 수
 */
export function cleanupBackups(rootDir, maxAge = 30, maxCount = 50) {
  const backups = listBackups(rootDir);
  if (backups.length === 0) {
    return 0;
  }

  let deletedCount = 0;
  const now = new Date();
  const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;

  // 나이별 정리
  const oldBackups = backups.filter(backup => {
    const age = now - backup.created;
    return age > maxAgeMs;
  });

  // 개수별 정리
  const excessBackups = backups.slice(maxCount);

  // 중복 제거
  const toDelete = [...new Set([...oldBackups, ...excessBackups])];

  toDelete.forEach(backup => {
    try {
      fs.unlinkSync(backup.path);
      deletedCount++;
      console.log(chalk.gray(`🗑️  오래된 백업 삭제: ${backup.name}`));
    } catch (error) {
      console.error(chalk.red(`백업 삭제 실패: ${backup.name} - ${error.message}`));
    }
  });

  if (deletedCount > 0) {
    console.log(chalk.green(`✅ ${deletedCount}개의 오래된 백업 파일을 정리했습니다.`));
  }

  return deletedCount;
}

export async function modifyCode(filePath, request, genAI, prompts, rootDir) {
  let backupPath = null; // 백업 경로를 저장할 변수 선언
  
  try {
    console.log(chalk.blue(`\n코드 수정 시작: ${filePath}`));
    
    // 입력 검증 및 보안 처리
    const sanitizedRequest = sanitizeInput(request);
    const targetPath = validateAndNormalizePath(filePath, rootDir);
    
    // 파일 확장자 검증
    if (!isAllowedFileExtension(targetPath)) {
      throw new Error(`허용되지 않은 파일 형식입니다: ${path.extname(filePath)}`);
    }
    
    console.log(chalk.gray(`대상 파일: ${targetPath}`));
    
    // 파일 존재 여부 및 크기 확인
    if (!fs.existsSync(targetPath)) {
      console.log(chalk.yellow(`\n⚠️  파일을 찾을 수 없습니다: ${filePath}`));
      console.log(chalk.gray(`현재 디렉토리: ${currentDir}`));
      
      // 유사한 파일명 제안
      try {
        const dir = path.dirname(targetPath);
        const filename = path.basename(targetPath);
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const similar = files.filter(f => f.includes(filename.split('.')[0]));
          if (similar.length > 0) {
            console.log(chalk.cyan('\n유사한 파일들:'));
            similar.forEach(f => console.log(chalk.gray(`  - ${f}`)));
          }
        }
      } catch (e) {
        // 무시
      }
      
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    // 파일 크기 확인
    if (!isFileSizeAllowed(targetPath)) {
      throw new Error('파일 크기가 너무 큽니다 (10MB 제한)');
    }

    // 원본 파일 읽기
    let originalContent;
    try {
      originalContent = fs.readFileSync(targetPath, 'utf-8');
    } catch (readError) {
      throw new Error(`파일 읽기 실패: ${readError.message}`);
    }

    if (originalContent.trim().length === 0) {
      console.log(chalk.yellow('\n⚠️  파일이 비어있습니다.'));
      return null;
    }

    // 백업 디렉토리 생성 및 백업 파일 저장
    try {
      const backupDir = ensureBackupDirectory(rootDir);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupPath = path.join(backupDir, `${path.basename(filePath)}.${timestamp}.backup`);
      fs.writeFileSync(backupPath, originalContent);
      console.log(chalk.green(`✅ 백업 완료: ${backupPath}`));
    } catch (backupError) {
      console.log(chalk.yellow(`⚠️  백업 실패: ${backupError.message}`));
    }

    // API 호출 전 prompts 검증
    if (!prompts || !prompts.codeModification) {
      throw new Error('프롬프트 설정이 올바르지 않습니다.');
    }

    // Gemini AI에 수정 요청
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
      message: `다음 코드를 수정해주세요:\n\n${originalContent}\n\n수정 요청: ${sanitizedRequest}`,
    });

    // API 응답 검증
    if (!result || !result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('AI 응답이 올바르지 않습니다.');
    }

    let response;
    try {
      response = JSON.parse(result.candidates[0].content.parts[0].text);
    } catch (parseError) {
      console.log(chalk.yellow('\n⚠️  JSON 파싱 실패, 원본 응답 사용'));
      const rawResponse = result.candidates[0].content.parts[0].text;
      
      // 간단한 코드 블록 추출 시도
      const codeMatch = rawResponse.match(/```[\w]*\n([\s\S]*?)```/);
      if (codeMatch) {
        response = {
          code: codeMatch[1],
          explanation: rawResponse.replace(/```[\w]*\n[\s\S]*?```/g, '').trim()
        };
      } else {
        throw new Error(`응답 파싱 실패: ${parseError.message}`);
      }
    }

    // 응답 유효성 검증
    if (!response.code || typeof response.code !== 'string') {
      throw new Error('수정된 코드를 받을 수 없습니다.');
    }

    // 수정된 코드를 파일에 쓰기
    try {
      fs.writeFileSync(targetPath, response.code);
      console.log(chalk.green('✅ 파일 수정 완료'));
    } catch (writeError) {
      throw new Error(`파일 쓰기 실패: ${writeError.message}`);
    }

    return {
      file: filePath,
      backup: backupPath,
      explanation: response.explanation || '수정 설명이 제공되지 않았습니다.'
    };
  } catch (error) {
    console.error(chalk.red(`\n❌ 코드 수정 중 오류 발생: ${error.message}`));
    
    // 네트워크 오류 처리
    if (error.message.includes('fetch') || error.message.includes('network')) {
      console.log(chalk.yellow('\n🔄 네트워크 연결을 확인하고 다시 시도해주세요.'));
    }
    
    // API 키 오류 처리
    if (error.message.includes('API') || error.message.includes('key')) {
      console.log(chalk.yellow('\n🔑 API 키 설정을 확인해주세요.'));
    }
    
    throw error;
  }
} 