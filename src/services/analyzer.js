import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { formatAnalysisResult } from '../utils/formatting.js';

export function analyzeProjectStructure() {
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

export async function analyzeProject(genAI, prompts) {
  try {
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

    const analysis = result.candidates[0].content.parts[0].text;
    console.log(chalk.green('\n✨ 분석 결과: ✨\n'));
    console.log(formatAnalysisResult(analysis));
    console.log(chalk.green('\n------------------------------------\n'));
    return analysis;
  } catch (error) {
    throw new Error(`프로젝트 분석 중 오류 발생: ${error.message}`);
  }
}

export async function analyzeCode(filePath, genAI, prompts) {
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

    const analysis = result.candidates[0].content.parts[0].text;
    console.log(chalk.green('\n✨ 분석 결과: ✨\n'));
    console.log(formatAnalysisResult(analysis));
    console.log(chalk.green('\n------------------------------------\n'));
    return analysis;
  } catch (error) {
    throw new Error(`코드 분석 중 오류 발생: ${error.message}`);
  }
} 