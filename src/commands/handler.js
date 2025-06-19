import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { analyzeProject, analyzeCode } from '../services/analyzer.js';
import { modifyCode, listBackups, restoreFromBackup, cleanupBackups } from '../services/modifier.js';
import { sanitizeInput } from '../utils/security.js';

/**
 * 도움말 표시 함수
 */
function showHelp() {
  console.log(chalk.blue('\n🤖 Gemini CLI 도움말\n'));
  console.log(chalk.yellow('기본 명령어:'));
  console.log(chalk.green('  gemini') + chalk.gray('                    - 대화형 모드 시작'));
  console.log(chalk.green('  gemini "질문"') + chalk.gray('             - 단일 질문 모드'));
  console.log('');
  console.log(chalk.yellow('분석 명령어:'));
  console.log(chalk.green('  프로젝트 분석해줘') + chalk.gray('           - 전체 프로젝트 분석'));
  console.log(chalk.green('  [파일명] 분석해줘') + chalk.gray('          - 특정 파일 분석'));
  console.log('');
  console.log(chalk.yellow('수정 명령어:'));
  console.log(chalk.green('  [파일명] 수정해줘') + chalk.gray('          - 파일 수정'));
  console.log('');
  console.log(chalk.yellow('문서 명령어:'));
  console.log(chalk.green('  README 작성해줘') + chalk.gray('           - README.md 생성'));
  console.log('');
  console.log(chalk.yellow('백업 관리:'));
  console.log(chalk.green('  backup list') + chalk.gray('               - 백업 파일 목록 보기'));
  console.log(chalk.green('  backup restore [파일명]') + chalk.gray('    - 백업에서 복원'));
  console.log(chalk.green('  backup cleanup') + chalk.gray('            - 오래된 백업 정리'));
  console.log('');
  console.log(chalk.yellow('기타:'));
  console.log(chalk.green('  help') + chalk.gray('                      - 이 도움말 표시'));
  console.log(chalk.green('  exit, quit') + chalk.gray('               - 프로그램 종료'));
  console.log('');
}

export async function handleCommand(input, genAI, prompts, rootDir) {
  // 입력 정제
  const sanitizedInput = sanitizeInput(input);
  
  // 직접 명령어 처리
  if (sanitizedInput.toLowerCase() === 'help' || sanitizedInput.includes('도움말')) {
    showHelp();
    return true;
  }
  
  if (sanitizedInput.toLowerCase().startsWith('backup ')) {
    return handleBackupCommand(sanitizedInput, rootDir);
  }
  
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
            action: { type: "STRING", enum: ["analyze", "modify", "chat", "readme", "help", "backup", "restore", "cleanup"] },
            filePath: { type: "STRING" },
            request: { type: "STRING" },
            text: { type: "STRING" }
          },
          required: ["action", "text"]
        }
      }
    });

    const result = await commandChat.sendMessage({ message: sanitizedInput });
    const response = JSON.parse(result.candidates[0].content.parts[0].text);

    switch (response.action) {
      case "analyze":
        if (!response.filePath) {
          console.log(chalk.yellow("\n프로젝트 전체를 분석합니다...\n"));
          try {
            await analyzeProject(genAI, prompts);
          } catch (error) {
            console.error(chalk.red(`분석 실패: ${error.message}`));
          }
        } else {
          try {
            // 보안 검증된 파일 경로 처리
            let targetPath = response.filePath;
            
            // 파일 확장자 자동 감지 (보안 검증 전)
            if (!path.extname(targetPath)) {
              const possibleExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md'];
              let foundPath = null;
              
              for (const ext of possibleExtensions) {
                const pathWithExt = path.isAbsolute(targetPath) 
                  ? targetPath + ext 
                  : path.resolve(process.cwd(), targetPath + ext);
                if (fs.existsSync(pathWithExt)) {
                  foundPath = targetPath + ext;
                  break;
                }
              }
              
              if (foundPath) {
                targetPath = foundPath;
                console.log(chalk.cyan(`파일 확장자 자동 감지: ${response.filePath} → ${targetPath}`));
              }
            }
            
            await analyzeCode(targetPath, genAI, prompts);
          } catch (error) {
            console.error(chalk.red(`코드 분석 실패: ${error.message}`));
          }
        }
        break;

      case "modify":
        if (!response.filePath || !response.request) {
          console.log(chalk.yellow("파일 경로나 수정 요청이 지정되지 않았습니다."));
          return true;
        }
        
        try {
          // 파일 경로 처리 (modifyCode에서 보안 검증 수행)
          let targetPath = response.filePath;
          
          // 파일 확장자 자동 감지
          if (!path.extname(targetPath)) {
            const possibleExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md'];
            let foundPath = null;
            
            for (const ext of possibleExtensions) {
              const pathWithExt = path.isAbsolute(targetPath) 
                ? targetPath + ext 
                : path.resolve(process.cwd(), targetPath + ext);
              if (fs.existsSync(pathWithExt)) {
                foundPath = targetPath + ext;
                break;
              }
            }
            
            if (foundPath) {
              targetPath = foundPath;
              console.log(chalk.cyan(`파일 확장자 자동 감지: ${response.filePath} → ${targetPath}`));
            }
          }
          
          const result = await modifyCode(targetPath, response.request, genAI, prompts, rootDir);
          
          if (result) {
            console.log(chalk.green('\n✨ 수정 결과: ✨\n'));
            console.log(chalk.yellow(`원본 파일이 ${result.backup}에 백업되었습니다.`));
            console.log(chalk.green(`파일이 성공적으로 수정되었습니다: ${result.file}`));
            console.log(chalk.blue('\n수정 내용:'));
            console.log(result.explanation);
            console.log(chalk.green('\n------------------------------------\n'));
          }
        } catch (error) {
          console.error(chalk.red(`코드 수정 실패: ${error.message}`));
        }
        break;

      case "readme":
        try {
          const readmePath = path.join(process.cwd(), 'README.md');
          const readmeContent = response.text;
          fs.writeFileSync(readmePath, readmeContent);
          console.log(chalk.green('\n✨ README.md 파일이 성공적으로 작성되었습니다. ✨\n'));
          console.log(chalk.blue('작성된 내용:'));
          console.log(readmeContent);
          console.log(chalk.green('\n------------------------------------\n'));
        } catch (error) {
          console.error(chalk.red(`README 작성 중 오류 발생: ${error.message}`));
        }
        break;

      case "help":
        showHelp();
        break;
        
      case "backup":
        return handleBackupCommand(response.request || 'list', rootDir);
        
      case "chat":
        return false;
    }
    return true;
  } catch (error) {
    console.error(chalk.red("명령어 처리 중 오류 발생:", error.message));
    return false;
  }
}

/**
 * 백업 관련 명령어 처리
 * @param {string} command - 백업 명령어
 * @param {string} rootDir - 루트 디렉토리
 * @returns {boolean} - 명령어 처리 성공 여부
 */
function handleBackupCommand(command, rootDir) {
  const parts = command.toLowerCase().split(' ');
  const action = parts[1] || 'list';
  
  try {
    switch (action) {
      case 'list':
        const backups = listBackups(rootDir);
        if (backups.length === 0) {
          console.log(chalk.yellow('\n📁 백업 파일이 없습니다.'));
        } else {
          console.log(chalk.blue('\n📁 백업 파일 목록:\n'));
          backups.forEach((backup, index) => {
            const sizeKB = Math.round(backup.size / 1024);
            const timeAgo = getTimeAgo(backup.created);
            console.log(chalk.green(`${index + 1}. ${backup.name}`));
            console.log(chalk.gray(`   원본: ${backup.originalFile}`));
            console.log(chalk.gray(`   크기: ${sizeKB}KB | 생성: ${timeAgo}`));
            console.log('');
          });
        }
        break;
        
      case 'restore':
        const filename = parts.slice(2).join(' ');
        if (!filename) {
          console.log(chalk.yellow('복원할 백업 파일명을 지정해주세요.'));
          console.log(chalk.gray('예: backup restore myfile.js.2024-01-15T10-30-00-000Z.backup'));
          return true;
        }
        
        const backupPath = path.join(rootDir, 'backup', filename);
        const success = restoreFromBackup(backupPath);
        if (!success) {
          // 파일명으로 검색 시도
          const backups = listBackups(rootDir);
          const foundBackup = backups.find(b => 
            b.name.includes(filename) || b.originalFile.includes(filename)
          );
          if (foundBackup) {
            console.log(chalk.cyan(`유사한 백업 파일 발견: ${foundBackup.name}`));
            restoreFromBackup(foundBackup.path);
          }
        }
        break;
        
      case 'cleanup':
        console.log(chalk.blue('\n🧹 백업 파일 정리 중...'));
        const deletedCount = cleanupBackups(rootDir);
        if (deletedCount === 0) {
          console.log(chalk.green('정리할 백업 파일이 없습니다.'));
        }
        break;
        
      default:
        console.log(chalk.yellow(`알 수 없는 백업 명령어: ${action}`));
        console.log(chalk.gray('사용 가능한 명령어: list, restore [파일명], cleanup'));
    }
  } catch (error) {
    console.error(chalk.red(`백업 명령어 처리 실패: ${error.message}`));
  }
  
  return true;
}

/**
 * 시간 경과 표시 유틸리티
 * @param {Date} date - 기준 날짜
 * @returns {string} - 경과 시간 문자열
 */
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
} 