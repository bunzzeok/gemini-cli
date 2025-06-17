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
  try {
    // 현재 작업 디렉토리 기준으로 파일 경로 해석
    const currentDir = process.cwd();
    const targetPath = path.resolve(currentDir, filePath);
    
    // 파일 존재 여부 확인
    if (!fs.existsSync(targetPath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    // 원본 파일 읽기
    const originalContent = fs.readFileSync(targetPath, 'utf-8');

    // 백업 디렉토리 생성
    const backupDir = ensureBackupDirectory(rootDir);
    const backupPath = path.join(backupDir, `${path.basename(filePath)}.${Date.now()}.backup`);
    fs.writeFileSync(backupPath, originalContent);

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

    const response = JSON.parse(result.candidates[0].content.parts[0].text);

    // 수정된 코드를 파일에 쓰기
    fs.writeFileSync(targetPath, response.code);

    return {
      file: filePath,
      backup: backupPath,
      explanation: response.explanation
    };
  } catch (error) {
    throw new Error(`코드 수정 중 오류 발생: ${error.message}`);
  }
} 