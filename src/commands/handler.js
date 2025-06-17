import path from 'path';
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
            action: { type: "STRING", enum: ["analyze", "modify", "chat"] },
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
          const filePath = path.resolve(rootDir, response.filePath);
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
        const targetPath = path.resolve(rootDir, response.filePath);
        try {
          const modification = await modifyCode(targetPath, response.request, genAI, prompts, rootDir);
          console.log(chalk.green('\n✨ 수정 결과: ✨\n'));
          console.log(modification);
          console.log(chalk.green('\n------------------------------------\n'));
        } catch (error) {
          console.error(chalk.red(error.message));
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