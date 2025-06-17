import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export function ensureBackupDirectory(filePath, rootDir) {
  const backupDir = path.join(rootDir, 'backup');
  const relativePath = path.relative(rootDir, filePath);
  const backupPath = path.join(backupDir, relativePath);
  const backupDirPath = path.dirname(backupPath);

  // backup 디렉토리가 없으면 생성
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 백업 파일의 디렉토리 구조 생성
  if (!fs.existsSync(backupDirPath)) {
    fs.mkdirSync(backupDirPath, { recursive: true });
  }

  return backupPath;
}

export async function modifyCode(filePath, modificationRequest, genAI, prompts, rootDir) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
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
      message: `다음 코드를 수정해주세요:\n\n${content}\n\n수정 요청: ${modificationRequest}`,
    });

    const response = JSON.parse(result.candidates[0].content.parts[0].text);

    // 원본 파일 백업
    const backupPath = ensureBackupDirectory(filePath, rootDir);
    fs.writeFileSync(backupPath, content);
    console.log(chalk.yellow(`\n원본 파일이 ${backupPath}에 백업되었습니다.`));

    // 수정된 코드를 파일에 저장
    fs.writeFileSync(filePath, response.code);
    console.log(chalk.green('\n✨ 파일이 성공적으로 수정되었습니다. ✨\n'));
    
    return response.explanation;
  } catch (error) {
    throw new Error(`코드 수정 중 오류 발생: ${error.message}`);
  }
} 