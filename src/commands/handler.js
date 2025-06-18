import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { analyzeProject, analyzeCode } from '../services/analyzer.js';
import { modifyCode } from '../services/modifier.js';

export async function handleCommand(input, genAI, prompts, rootDir) {
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
            action: { type: "STRING", enum: ["analyze", "modify", "chat", "readme"] },
            filePath: { type: "STRING" },
            request: { type: "STRING" },
            text: { type: "STRING" }
          },
          required: ["action", "text"]
        }
      }
    });

    const result = await commandChat.sendMessage({ message: input });
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
          // 파일 경로 정규화
          let targetPath = response.filePath;
          
          // 상대 경로 처리
          if (!path.isAbsolute(targetPath)) {
            targetPath = path.resolve(process.cwd(), targetPath);
          }
          
          // 파일 확장자 추가 (필요시)
          if (!path.extname(targetPath)) {
            const possibleExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md'];
            let foundPath = null;
            
            for (const ext of possibleExtensions) {
              const pathWithExt = targetPath + ext;
              if (fs.existsSync(pathWithExt)) {
                foundPath = pathWithExt;
                break;
              }
            }
            
            if (foundPath) {
              targetPath = foundPath;
              console.log(chalk.cyan(`파일 경로 자동 보정: ${response.filePath} → ${path.relative(process.cwd(), targetPath)}`));
            }
          }
          
          try {
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
          // 파일 경로 정규화
          let targetPath = response.filePath;
          
          // 상대 경로 처리
          if (!path.isAbsolute(targetPath)) {
            targetPath = path.resolve(process.cwd(), targetPath);
          }
          
          // 파일 확장자 추가 (필요시)
          if (!path.extname(targetPath)) {
            const possibleExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md'];
            let foundPath = null;
            
            for (const ext of possibleExtensions) {
              const pathWithExt = targetPath + ext;
              if (fs.existsSync(pathWithExt)) {
                foundPath = pathWithExt;
                break;
              }
            }
            
            if (foundPath) {
              targetPath = foundPath;
              console.log(chalk.cyan(`파일 경로 자동 보정: ${response.filePath} → ${path.relative(process.cwd(), targetPath)}`));
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

      case "chat":
        return false;
    }
    return true;
  } catch (error) {
    console.error(chalk.red("명령어 처리 중 오류 발생:", error.message));
    return false;
  }
} 