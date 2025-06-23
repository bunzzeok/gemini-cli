// Internationalization utilities
import { loadSettings } from '../config/settings.js';

export const messages = {
  ko: {
    welcome: "Gemini CLI에 오신 것을 환영합니다! (종료하려면 \"exit\" 또는 \"quit\"를 입력하세요)",
    searching: "🔍 검색 중...",
    searchResult: "🔍 검색 결과",
    references: "📚 참고 자료",
    searchStarted: "🌐 웹 검색을 시작합니다",
    sufficientInfo: "✅ 충분한 정보가 수집되었습니다.",
    additionalSearch: "🔄 보완 검색 중...",
    analyzing: "프로젝트 전체를 분석합니다...",
    modifying: "파일을 수정합니다...",
    generating: "README 파일을 생성합니다...",
    help: {
      title: "🤖 Gemini CLI 도움말",
      basic: "기본 명령어:",
      analysis: "분석 명령어:",
      modification: "수정 명령어:",
      smart: "💡 스마트 AI 기능:",
      document: "문서 명령어:",
      backup: "백업 관리:",
      settings: "⚙️ 설정:",
      other: "기타:"
    },
    settings: {
      currentModel: "현재 모델",
      currentLanguage: "현재 언어",
      modelChanged: "모델이 변경되었습니다",
      languageChanged: "언어가 변경되었습니다",
      invalidModel: "유효하지 않은 모델입니다",
      invalidLanguage: "유효하지 않은 언어입니다",
      availableModels: "사용 가능한 모델",
      availableLanguages: "사용 가능한 언어"
    },
    errors: {
      apiKeyMissing: "Gemini API 키가 설정되지 않았습니다.",
      apiKeyInstruction: "https://makersuite.google.com/app/apikey 에서 API 키를 발급받아 .env 파일에 설정해주세요.",
      programExit: "프로그램을 종료합니다.",
      commandError: "명령어 처리 중 오류",
      inputError: "입력 처리 중 오류가 발생했습니다",
      generalError: "오류가 발생했습니다",
      loadingFailed: "설정 로드 실패, 기본 설정 사용",
      savingFailed: "설정 저장 실패",
      modificationFailed: "파일 수정 실패",
      backupFailed: "백업 작업 실패",
      searchFailed: "웹 검색 실패",
      analysisFailed: "프로젝트 분석 실패",
      fileMissing: "파일 경로가 제공되지 않았습니다",
      jsonParseError: "JSON 파싱 오류",
      formatError: "포맷팅 중 오류 발생"
    },
    ui: {
      thinking: "Gemini가 생각중입니다...",
      analysisResult: "분석 결과: ✨",
      detailInfo: "상세 정보",
      ready: "🚀 Ready! Start chatting with Gemini AI...",
      quickTips: "💡 Quick Tips:",
      typeQuestion: "• Type your question and press Enter",
      multiline: "• Use \\\\ at end of line for multi-line input",
      helpCommand: "• Type \"help\" for commands, \"exit\" to quit",
      webSearch: "• Web search automatically triggered for latest info",
      multilineTip: "줄 끝에 \\\\를 추가하고 Enter를 누르면 다음 줄로 이어집니다.",
      response: "답변:"
    },
    commands: {
      help: "도움말",
      analyzing: "분석 중",
      modifying: "수정 중",
      generating: "README 파일 생성 중",
      backupCreated: "백업 생성됨",
      backupRestored: "백업 복원됨",
      fileModified: "파일이 성공적으로 수정되었습니다",
      readmeGenerated: "README.md 파일이 성공적으로 생성되었습니다",
      projectTree: "프로젝트 구조",
      searchStarted: "웹 검색 시작",
      searchCompleted: "웹 검색 완료",
      insufficientResults: "검색 결과 부족, 추가 검색 수행",
      
      // Help command descriptions
      startInteractive: "대화형 모드 시작",
      singleQuestion: "단일 질문 모드",
      analyzeProject: "전체 프로젝트 분석",
      analyzeFile: "특정 파일 분석",
      showTree: "프로젝트 디렉토리 구조 보기",
      modifyFile: "파일 수정",
      autoWebSearch: "최신 정보 자동 웹 검색",
      realtimeSearch: "실시간 정보 검색",
      expertInfo: "전문 정보 수집",
      webSearchConditions: "자동 웹 검색 동작 조건:",
      latestNewsInfo: "최신 정보나 뉴스가 필요한 질문",
      realtimeData: "실시간 데이터나 현재 상황 문의",
      productInfo: "구체적인 제품/서비스 정보 요청",
      techComparison: "기술 비교나 튜토리얼 요청"
    }
  },
  en: {
    welcome: "Welcome to Gemini CLI! (Type \"exit\" or \"quit\" to terminate)",
    searching: "🔍 Searching...",
    searchResult: "🔍 Search Results",
    references: "📚 References",
    searchStarted: "🌐 Starting web search",
    sufficientInfo: "✅ Sufficient information collected.",
    additionalSearch: "🔄 Additional search...",
    analyzing: "Analyzing entire project...",
    modifying: "Modifying file...",
    generating: "Generating README file...",
    help: {
      title: "🤖 Gemini CLI Help",
      basic: "Basic Commands:",
      analysis: "Analysis Commands:",
      modification: "Modification Commands:",
      smart: "💡 Smart AI Features:",
      document: "Document Commands:",
      backup: "Backup Management:",
      settings: "⚙️ Settings:",
      other: "Other:"
    },
    settings: {
      currentModel: "Current Model",
      currentLanguage: "Current Language",
      modelChanged: "Model changed to",
      languageChanged: "Language changed to",
      invalidModel: "Invalid model",
      invalidLanguage: "Invalid language",
      availableModels: "Available Models",
      availableLanguages: "Available Languages"
    },
    errors: {
      apiKeyMissing: "Gemini API key is not configured.",
      apiKeyInstruction: "Please get an API key from https://makersuite.google.com/app/apikey and set it in your .env file.",
      programExit: "Exiting program.",
      commandError: "Error processing command",
      inputError: "Error occurred while processing input",
      generalError: "An error occurred",
      loadingFailed: "Failed to load settings, using defaults",
      savingFailed: "Failed to save settings",
      modificationFailed: "File modification failed",
      backupFailed: "Backup operation failed",
      searchFailed: "Web search failed",
      analysisFailed: "Project analysis failed",
      fileMissing: "File path not provided",
      jsonParseError: "JSON parsing error",
      formatError: "Error occurred during formatting"
    },
    ui: {
      thinking: "Gemini is thinking...",
      analysisResult: "Analysis result: ✨",
      detailInfo: "Details",
      ready: "🚀 Ready! Start chatting with Gemini AI...",
      quickTips: "💡 Quick Tips:",
      typeQuestion: "• Type your question and press Enter",
      multiline: "• Use \\\\ at end of line for multi-line input",
      helpCommand: "• Type \"help\" for commands, \"exit\" to quit",
      webSearch: "• Web search automatically triggered for latest info",
      multilineTip: "Tip: Add \\\\\\\\ at the end of line and press Enter to continue to next line.",
      response: "Response:"
    },
    commands: {
      help: "help",
      analyzing: "Analyzing",
      modifying: "Modifying",
      generating: "Generating README file",
      backupCreated: "Backup created",
      backupRestored: "Backup restored",
      fileModified: "File modified successfully",
      readmeGenerated: "README.md file generated successfully",
      projectTree: "Project structure",
      searchStarted: "Starting web search",
      searchCompleted: "Web search completed",
      insufficientResults: "Insufficient search results, performing additional search",
      
      // Help command descriptions
      startInteractive: "Start interactive mode",
      singleQuestion: "Single question mode",
      analyzeProject: "Analyze entire project",
      analyzeFile: "Analyze specific file",
      showTree: "Show project directory structure",
      modifyFile: "Modify file",
      autoWebSearch: "Auto web search for latest info",
      realtimeSearch: "Real-time info search",
      expertInfo: "Expert info collection",
      webSearchConditions: "Auto web search conditions:",
      latestNewsInfo: "Questions requiring latest news/info",
      realtimeData: "Real-time data or current situation queries",
      productInfo: "Specific product/service info requests",
      techComparison: "Tech comparisons or tutorial requests"
    }
  }
};

export function t(key, lang = null) {
  // Get current language from settings if not provided
  if (!lang) {
    lang = loadSettings().language || 'ko';
  }
  const keys = key.split('.');
  let value = messages[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return value || key;
}