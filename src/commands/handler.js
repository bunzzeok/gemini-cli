import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { analyzeProject, analyzeCode, analyzeProjectStructure } from '../services/analyzer.js';
import { modifyCode, listBackups, restoreFromBackup, cleanupBackups } from '../services/modifier.js';
import { sanitizeInput } from '../utils/security.js';
import { WebSearchService } from '../services/websearch.js';
import { loadSettings, saveSettings, getAvailableModels, getAvailableModelNames, getAvailableLanguages } from '../config/settings.js';
import { t } from '../utils/i18n.js';

/**
 * 도움말 표시 함수
 */
function showHelp() {
  const settings = loadSettings();
  const lang = settings.language;
  
  console.log(chalk.blue(`\n${t('help.title', lang)}\n`));
  console.log(chalk.yellow(`${t('help.basic', lang)}`));
  console.log(chalk.green('  gemini') + chalk.gray('                    - ' + t('commands.startInteractive', lang)));
  console.log(chalk.green('  gemini "' + (lang === 'ko' ? '질문' : 'question') + '"') + chalk.gray('             - ' + t('commands.singleQuestion', lang)));
  console.log('');
  console.log(chalk.yellow(`${t('help.analysis', lang)}`));
  console.log(chalk.green('  ' + (lang === 'ko' ? '프로젝트 분석해줘' : 'analyze project')) + chalk.gray('           - ' + t('commands.analyzeProject', lang)));
  console.log(chalk.green('  [' + (lang === 'ko' ? '파일명' : 'filename') + '] ' + (lang === 'ko' ? '분석해줘' : 'analyze')) + chalk.gray('          - ' + t('commands.analyzeFile', lang)));
  console.log(chalk.green('  tree') + chalk.gray('                      - ' + t('commands.showTree', lang)));
  console.log('');
  console.log(chalk.yellow(`${t('help.modification', lang)}`));
  console.log(chalk.green('  [' + (lang === 'ko' ? '파일명' : 'filename') + '] ' + (lang === 'ko' ? '수정해줘' : 'modify')) + chalk.gray('          - ' + (lang === 'ko' ? '파일 수정' : 'Modify file')));
  console.log('');
  console.log(chalk.yellow(`${t('help.smart', lang)}`));
  console.log(chalk.green('  "' + (lang === 'ko' ? '2024년 AI 동향 알려줘' : 'Tell me about AI trends 2024') + '"') + chalk.gray('      - ' + (lang === 'ko' ? '최신 정보 자동 웹 검색' : 'Auto web search for latest info')));
  console.log(chalk.green('  "' + (lang === 'ko' ? 'React 19 새 기능은?' : 'What are React 19 new features?') + '"') + chalk.gray('       - ' + (lang === 'ko' ? '실시간 정보 검색' : 'Real-time info search')));
  console.log(chalk.green('  "' + (lang === 'ko' ? 'Python vs JavaScript 비교해줘' : 'Compare Python vs JavaScript') + '"') + chalk.gray(' - ' + (lang === 'ko' ? '전문 정보 수집' : 'Expert info collection')));
  console.log('');
  console.log(chalk.cyan('  ' + t('commands.webSearchConditions', lang)));
  console.log(chalk.gray('    • ' + (lang === 'ko' ? '최신 정보나 뉴스가 필요한 질문' : 'Questions requiring latest news/info')));
  console.log(chalk.gray('    • ' + (lang === 'ko' ? '실시간 데이터나 현재 상황 문의' : 'Real-time data or current situation queries')));
  console.log(chalk.gray('    • ' + (lang === 'ko' ? '구체적인 제품/서비스 정보 요청' : 'Specific product/service info requests')));
  console.log(chalk.gray('    • ' + (lang === 'ko' ? '기술 비교나 튜토리얼 요청' : 'Tech comparisons or tutorial requests')));
  console.log('');
  console.log(chalk.yellow(`${t('help.settings', lang)}`));
  console.log(chalk.green('  set model [model]') + chalk.gray('            - ' + (lang === 'ko' ? 'Gemini 모델 변경' : 'Change Gemini model')));
  console.log(chalk.green('  set language [ko|en]') + chalk.gray('         - ' + (lang === 'ko' ? '언어 변경' : 'Change language')));
  console.log(chalk.green('  settings') + chalk.gray('                   - ' + (lang === 'ko' ? '현재 설정 보기' : 'Show current settings')));
  console.log(chalk.green('  models') + chalk.gray('                    - ' + (lang === 'ko' ? '사용 가능한 모델 목록' : 'List available models')));
  console.log('');
  console.log(chalk.yellow(`${t('help.document', lang)}`));
  console.log(chalk.green('  README ' + (lang === 'ko' ? '작성해줘' : 'generate')) + chalk.gray('           - README.md ' + (lang === 'ko' ? '생성' : 'generation')));
  console.log('');
  console.log(chalk.yellow(`${t('help.backup', lang)}`));
  console.log(chalk.green('  backup list') + chalk.gray('               - ' + (lang === 'ko' ? '백업 파일 목록 보기' : 'List backup files')));
  console.log(chalk.green('  backup restore [' + (lang === 'ko' ? '파일명' : 'filename') + ']') + chalk.gray('    - ' + (lang === 'ko' ? '백업에서 복원' : 'Restore from backup')));
  console.log(chalk.green('  backup cleanup') + chalk.gray('            - ' + (lang === 'ko' ? '오래된 백업 정리' : 'Clean old backups')));
  console.log('');
  console.log(chalk.yellow(`${t('help.other', lang)}`));
  console.log(chalk.green('  help') + chalk.gray('                      - ' + (lang === 'ko' ? '이 도움말 표시' : 'Show this help')));
  console.log(chalk.green('  exit, quit') + chalk.gray('               - ' + (lang === 'ko' ? '프로그램 종료' : 'Exit program')));
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
  
  if (sanitizedInput.toLowerCase() === 'settings') {
    showSettings();
    return true;
  }
  
  if (sanitizedInput.toLowerCase() === 'models') {
    showAvailableModels();
    return true;
  }
  
  if (sanitizedInput.toLowerCase().startsWith('set ')) {
    return handleSettingsCommand(sanitizedInput);
  }
  
  if (sanitizedInput.toLowerCase() === 'tree') {
    showProjectTree(rootDir);
    return true;
  }
  
  if (sanitizedInput.toLowerCase().startsWith('backup ')) {
    return handleBackupCommand(sanitizedInput, rootDir);
  }
  
  
  try {
    const commandChat = genAI.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: `${prompts.codeAnalysis}

웹 검색 의도 판단:
사용자의 질문이 다음 중 하나에 해당하면 "websearch" 액션을 선택하세요:
- 최신 정보나 뉴스를 요청하는 경우 (예: "2024년 AI 동향", "최근 React 업데이트")
- 실시간 데이터나 현재 상황을 묻는 경우 (예: "현재 주가", "오늘 날씨")
- 구체적인 제품/서비스 정보를 요청하는 경우 (예: "iPhone 15 스펙", "ChatGPT 가격")
- 비교 정보를 요청하는 경우 (예: "Python vs JavaScript", "AWS vs Azure")
- 튜토리얼이나 가이드를 요청하는 경우 (예: "React 설치 방법", "Docker 사용법")
- "검색해줘", "찾아줘", "알아봐줘" 등의 표현이 포함된 경우
- 일반적인 지식을 넘어서는 전문적이거나 세부적인 정보를 요청하는 경우

웹 검색이 필요하지 않은 경우:
- 일반적인 대화나 질문
- 프로젝트 분석 요청
- 코드 수정 요청  
- 도움말 요청`,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            action: { type: "STRING", enum: ["analyze", "modify", "chat", "readme", "help", "backup", "restore", "cleanup", "websearch", "settings"] },
            filePath: { type: "STRING" },
            request: { type: "STRING" },
            text: { type: "STRING" },
            searchQuery: { type: "STRING" }
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
          console.log(chalk.blue('\n📝 프로젝트 분석을 통한 README 작성 중...\n'));
          
          // 프로젝트 구조 분석
          const projectStructure = analyzeProjectStructure();
          
          // README 생성을 위한 AI 호출
          const readmeChat = genAI.chats.create({
            model: "gemini-2.0-flash",
            config: {
              systemInstruction: `당신은 전문적인 프로젝트 문서 작성자입니다.
다음 규칙을 따라 README.md 파일을 작성해주세요:

1. 모든 내용은 한국어로 작성해주세요.
2. 프로젝트 구조를 분석하여 적절한 README를 작성해주세요.
3. 다음 항목들을 포함해주세요:
   - 프로젝트 제목과 간단한 설명
   - 주요 기능 목록
   - 설치 방법
   - 사용 방법
   - 기술 스택 (package.json 기반)
   - 프로젝트 구조
   - 기여 방법
   - 라이선스 정보

4. 프로젝트 파일 구조를 기반으로 정확한 정보를 제공해주세요.
5. 마크다운 형식으로 깔끔하게 작성해주세요.
6. 실제 프로젝트에 맞는 내용으로 작성해주세요.`,
              temperature: 0.7,
            },
          });

          const projectInfo = {
            structure: projectStructure,
            currentDir: process.cwd(),
            packageJson: null
          };

          // package.json 파일이 있으면 읽기
          try {
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(packageJsonPath)) {
              projectInfo.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            }
          } catch (e) {
            // package.json이 없거나 읽기 실패 시 무시
          }

          const readmeResult = await readmeChat.sendMessage({
            message: `다음 프로젝트 정보를 바탕으로 README.md 파일을 작성해주세요:

프로젝트 경로: ${projectInfo.currentDir}
프로젝트 구조: ${JSON.stringify(projectInfo.structure, null, 2)}
${projectInfo.packageJson ? `package.json 정보: ${JSON.stringify(projectInfo.packageJson, null, 2)}` : ''}

이 정보를 바탕으로 프로젝트에 맞는 README.md를 작성해주세요.`,
          });

          if (!readmeResult || !readmeResult.candidates || !readmeResult.candidates[0] || !readmeResult.candidates[0].content) {
            throw new Error('AI 응답이 올바르지 않습니다.');
          }

          const readmeContent = readmeResult.candidates[0].content.parts[0].text;
          
          // 새로운 README 파일명 생성 (기존 파일 덮어쓰지 않음)
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
          const readmePath = path.join(process.cwd(), `README-${timestamp}.md`);
          
          fs.writeFileSync(readmePath, readmeContent);
          console.log(chalk.green(`\n✨ README 파일이 성공적으로 작성되었습니다: ${path.basename(readmePath)} ✨\n`));
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
        
      case "websearch":
        return handleWebSearchCommand(response.searchQuery || response.text || sanitizedInput);
        
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
            console.log(chalk.gray(`   위치: ${backup.directory}`));
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

/**
 * 프로젝트 디렉토리 구조 표시
 * @param {string} rootDir - 루트 디렉토리
 */
function showProjectTree(rootDir) {
  console.log(chalk.blue('\n🌳 프로젝트 디렉토리 구조:\n'));
  console.log(chalk.gray(`현재 디렉토리: ${rootDir}\n`));
  
  const excludeDirs = ['node_modules', '.git', 'backup', 'dist', 'build', '.next'];
  const excludeFiles = ['.log', '.backup', '.lock', '.map'];
  
  function buildTree(dir, prefix = '', isLast = true) {
    try {
      const items = fs.readdirSync(dir);
      const sortedItems = items.sort((a, b) => {
        const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
        const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });
      
      sortedItems.forEach((item, index) => {
        const fullPath = path.join(dir, item);
        const isLastItem = index === sortedItems.length - 1;
        const stats = fs.statSync(fullPath);
        
        // 제외할 항목들 건너뛰기
        if (excludeDirs.includes(item) || excludeFiles.some(ext => item.endsWith(ext))) {
          return;
        }
        
        const connector = isLastItem ? '└── ' : '├── ';
        const nextPrefix = isLastItem ? '    ' : '│   ';
        
        if (stats.isDirectory()) {
          console.log(chalk.blue(`${prefix}${connector}${chalk.bold(item)}/`));
          buildTree(fullPath, prefix + nextPrefix, isLastItem);
        } else {
          const ext = path.extname(item);
          let color = chalk.white;
          
          // 파일 확장자별 색상 구분
          if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
            color = chalk.yellow;
          } else if (['.json', '.md'].includes(ext)) {
            color = chalk.green;
          } else if (['.css', '.scss', '.sass'].includes(ext)) {
            color = chalk.magenta;
          } else if (['.html', '.xml'].includes(ext)) {
            color = chalk.cyan;
          }
          
          console.log(`${prefix}${connector}${color(item)}`);
        }
      });
    } catch (error) {
      console.log(chalk.red(`${prefix}└── [접근 오류: ${error.message}]`));
    }
  }
  
  buildTree(rootDir);
  console.log('');
}

/**
 * 현재 설정 표시
 */
function showSettings() {
  const settings = loadSettings();
  const lang = settings.language;
  
  console.log(chalk.blue('\n⚙️ Current Settings\n'));
  console.log(chalk.yellow(`${t('settings.currentModel', lang)}: `) + chalk.green(settings.model));
  console.log(chalk.yellow(`${t('settings.currentLanguage', lang)}: `) + chalk.green(settings.language === 'ko' ? '한국어' : 'English'));
  console.log(chalk.yellow('Temperature: ') + chalk.green(settings.temperature));
  console.log(chalk.yellow('Web Search Model: ') + chalk.green(settings.webSearchModel));
  console.log('');
}

/**
 * 설정 명령어 처리
 */
function handleSettingsCommand(input) {
  const settings = loadSettings();
  const lang = settings.language;
  const parts = input.split(' ');
  
  if (parts.length < 3) {
    console.log(chalk.yellow(lang === 'ko' ? '사용법: set model [모델명] 또는 set language [ko|en]' : 'Usage: set model [model] or set language [ko|en]'));
    return true;
  }
  
  const setting = parts[1].toLowerCase();
  const value = parts[2].toLowerCase();
  
  if (setting === 'model') {
    const availableModelNames = getAvailableModelNames();
    if (!availableModelNames.includes(value)) {
      console.log(chalk.red(`${t('settings.invalidModel', lang)}: ${value}`));
      console.log(chalk.yellow(`${t('settings.availableModels', lang)}: ${availableModelNames.join(', ')}`));
      return true;
    }
    
    saveSettings({ model: value, webSearchModel: value });
    console.log(chalk.green(`${t('settings.modelChanged', lang)}: ${value}`));
  } else if (setting === 'language') {
    const availableLanguages = Object.keys(getAvailableLanguages());
    if (!availableLanguages.includes(value)) {
      console.log(chalk.red(`${t('settings.invalidLanguage', lang)}: ${value}`));
      console.log(chalk.yellow(`${t('settings.availableLanguages', lang)}: ${availableLanguages.join(', ')}`));
      return true;
    }
    
    saveSettings({ language: value });
    console.log(chalk.green(`${t('settings.languageChanged', value)}: ${getAvailableLanguages()[value]}`));
  } else {
    console.log(chalk.yellow(lang === 'ko' ? '알 수 없는 설정입니다.' : 'Unknown setting.'));
  }
  
  return true;
}

/**
 * 사용 가능한 모델 목록 표시
 */
function showAvailableModels() {
  const settings = loadSettings();
  const lang = settings.language;
  const models = getAvailableModels();
  
  console.log(chalk.blue('\n🤖 Available Gemini Models\n'));
  
  Object.entries(models).forEach(([modelName, modelInfo]) => {
    const isCurrentModel = settings.model === modelName;
    const marker = isCurrentModel ? chalk.green(' ← Current') : '';
    
    console.log(chalk.cyan(`📍 ${modelName}${marker}`));
    console.log(chalk.gray(`   ${modelInfo.description}`));
    console.log(chalk.yellow(`   Capabilities: ${modelInfo.capabilities.join(', ')}`));
    console.log('');
  });
  
  console.log(chalk.gray(`💡 ${lang === 'ko' ? '모델 변경: set model [모델명]' : 'Change model: set model [model-name]'}`));
  console.log('');
}

/**
 * 웹 검색 명령어 처리
 * @param {string} input - 웹 검색 명령어
 * @returns {boolean} - 명령어 처리 성공 여부
 */
async function handleWebSearchCommand(input) {
  try {
    const query = input.trim();
    
    if (!query) {
      console.log(chalk.yellow('검색할 내용을 입력해주세요.'));
      return true;
    }

    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      console.error(chalk.red('Gemini API 키가 설정되지 않았습니다.'));
      return true;
    }

    console.log(chalk.blue(`\n${t('searchStarted')}: "${query}"\n`));

    const webSearchService = new WebSearchService(process.env.GEMINI_API_KEY);
    const result = await webSearchService.search(query);

    if (result) {
      // 헤더
      console.log(chalk.blue('\n╔═══════════════════════════════════════╗'));
      console.log(chalk.blue('║              🔍 검색 결과              ║'));
      console.log(chalk.blue('╚═══════════════════════════════════════╝\n'));
      
      // 답변 내용
      console.log(chalk.white(result.answer));
      
      // 출처 정보 (간결하게)
      if (result.sources && result.sources.length > 0) {
        console.log(chalk.blue('\n┌─ 📚 참고 자료 ─────────────────────┐'));
        result.sources.slice(0, 3).forEach((source, index) => {
          const title = source.title.length > 50 ? source.title.substring(0, 47) + '...' : source.title;
          console.log(chalk.cyan(`│ ${index + 1}. ${title}`));
          console.log(chalk.gray(`│    ${source.url}`));
        });
        if (result.sources.length > 3) {
          console.log(chalk.gray(`│    ... 외 ${result.sources.length - 3}개 추가`));
        }
        console.log(chalk.blue('└────────────────────────────────────┘'));
      }
      
      console.log('');
    }

    return true;
  } catch (error) {
    console.error(chalk.red(`웹 검색 실행 중 오류 발생: ${error.message}`));
    return true;
  }
} 