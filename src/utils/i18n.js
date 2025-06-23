// Internationalization utilities
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
    }
  }
};

export function t(key, lang = 'ko') {
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