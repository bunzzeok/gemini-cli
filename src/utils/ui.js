import chalk from 'chalk';

/**
 * UI 유틸리티 함수들
 */

// 로딩 애니메이션
const loadingChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let loadingInterval;

/**
 * 로딩 애니메이션 시작
 * @param {string} message - 로딩 메시지
 */
export function startLoading(message = 'Gemini가 생각중입니다...') {
  let i = 0;
  loadingInterval = setInterval(() => {
    process.stdout.write(`\r${loadingChars[i]} ${message}`);
    i = (i + 1) % loadingChars.length;
  }, 100);
}

/**
 * 로딩 애니메이션 중지
 */
export function stopLoading() {
  clearInterval(loadingInterval);
  process.stdout.write("\r" + " ".repeat(50) + "\r"); // 로딩 텍스트 지우기
}

/**
 * 분석 결과 포맷팅
 * @param {string} analysis - 분석 결과 텍스트
 * @returns {string} - 포맷팅된 결과
 */
export function formatAnalysisResult(analysis) {
  try {
    // JSON 형식이 아닌 경우 직접 텍스트 처리
    let text = analysis;
    if (analysis.includes('```json')) {
      const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1];
        try {
          const result = JSON.parse(jsonStr);
          if (result.text) {
            text = result.text;
          }
        } catch (e) {
          console.error('JSON 파싱 오류:', e);
        }
      }
    }

    let formattedOutput = chalk.green('\n✨ 분석 결과: ✨\n\n');
    
    // 섹션별로 분리
    const sections = text.split('\n\n');
    
    sections.forEach(section => {
      if (section.trim()) {
        // 섹션 제목 찾기
        const titleMatch = section.match(/^\*\*([^*]+)\*\*:/);
        if (titleMatch) {
          const title = titleMatch[1].trim();
          const content = section.substring(titleMatch[0].length).trim();
          
          // 제목 스타일링
          formattedOutput += chalk.cyan(`📌 ${title}\n`);
          formattedOutput += chalk.cyan('─'.repeat(50) + '\n');
          
          // 내용 포맷팅
          if (content.includes('*   ')) {
            // 리스트 항목인 경우
            const items = content.split('*   ').filter(item => item.trim());
            items.forEach(item => {
              // 리스트 항목 내의 볼드 처리
              const formattedItem = item.replace(/\*\*([^*]+)\*\*/g, chalk.bold('$1'));
              formattedOutput += chalk.yellow('• ') + formattedItem.trim() + '\n';
            });
          } else {
            // 일반 텍스트인 경우
            formattedOutput += content + '\n';
          }
          formattedOutput += '\n';
        } else {
          // 제목이 없는 섹션
          formattedOutput += section + '\n\n';
        }
      }
    });

    return formattedOutput;
  } catch (error) {
    console.error('포맷팅 중 오류 발생:', error);
    return analysis;
  }
}

/**
 * 환영 메시지 출력
 */
export function showWelcomeMessage() {
  console.log(
    'Gemini CLI에 오신 것을 환영합니다! (종료하려면 "exit" 또는 "quit"를 입력하세요)'
  );
}

/**
 * 에러 메시지 출력
 * @param {string} message - 에러 메시지
 * @param {Error} error - 에러 객체 (선택사항)
 */
export function showError(message, error = null) {
  console.error(chalk.red(`❌ ${message}`));
  if (error && error.message) {
    console.error(chalk.gray(`상세 정보: ${error.message}`));
  }
}

/**
 * 성공 메시지 출력
 * @param {string} message - 성공 메시지
 */
export function showSuccess(message) {
  console.log(chalk.green(`✅ ${message}`));
}

/**
 * 경고 메시지 출력
 * @param {string} message - 경고 메시지
 */
export function showWarning(message) {
  console.log(chalk.yellow(`⚠️  ${message}`));
}

/**
 * 정보 메시지 출력
 * @param {string} message - 정보 메시지
 */
export function showInfo(message) {
  console.log(chalk.blue(`ℹ️  ${message}`));
}