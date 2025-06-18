import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export function ensureBackupDirectory(rootDir) {
  const backupDir = path.join(rootDir, 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

export async function modifyCode(filePath, request, genAI, prompts, rootDir) {
  let backupPath = null; // 백업 경로를 저장할 변수 선언
  
  try {
    console.log(chalk.blue(`\n코드 수정 시작: ${filePath}`));
    
    // 현재 작업 디렉토리 기준으로 파일 경로 해석
    const currentDir = process.cwd();
    const targetPath = path.isAbsolute(filePath) ? filePath : path.resolve(currentDir, filePath);
    
    console.log(chalk.gray(`대상 파일: ${targetPath}`));
    
    // 파일 존재 여부 확인
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
      message: `다음 코드를 수정해주세요:\n\n${originalContent}\n\n수정 요청: ${request}`,
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