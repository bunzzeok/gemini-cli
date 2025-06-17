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
          await analyzeProject(genAI, prompts);
        } else {
          const filePath = path.resolve(process.cwd(), response.filePath);
          try {
            await analyzeCode(filePath, genAI, prompts);
          } catch (error) {
            console.error(chalk.red(error.message));
          }
        }
        break;

      case "modify":
        if (!response.filePath || !response.request) {
          console.log(chalk.yellow("파일 경로나 수정 요청이 지정되지 않았습니다."));
          return true;
        }
        try {
          const result = await modifyCode(response.filePath, response.request, genAI, prompts, rootDir);
          console.log(chalk.green('\n✨ 수정 결과: ✨\n'));
          console.log(chalk.yellow(`원본 파일이 ${result.backup}에 백업되었습니다.`));
          console.log(chalk.green(`파일이 성공적으로 수정되었습니다: ${result.file}`));
          console.log(chalk.blue('\n수정 내용:'));
          console.log(result.explanation);
          console.log(chalk.green('\n------------------------------------\n'));
        } catch (error) {
          console.error(chalk.red(error.message));
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