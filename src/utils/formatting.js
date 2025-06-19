import chalk from 'chalk';

// JSON 문자열에서 제어 문자 제거 함수
function sanitizeJsonString(str) {
  // 제어 문자 제거 (탭, 줄바꿈 제외)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function formatAnalysisResult(analysis) {
  try {
    // JSON 형식이 아닌 경우 직접 텍스트 처리
    let text = analysis;
    
    // JSON 블록 검색 및 파싱
    if (analysis.includes('```json')) {
      const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[1];
        
        try {
          // 제어 문자 정리
          jsonStr = sanitizeJsonString(jsonStr);
          const result = JSON.parse(jsonStr);
          
          if (result && result.text) {
            text = result.text;
          }
        } catch (e) {
          console.error('JSON 파싱 오류:', e.message);
          // JSON 파싱 실패 시 원본 분석 결과 사용
          console.log('원본 분석 결과를 사용합니다.');
        }
      }
    }
    
    // 만약 여전히 JSON 형태라면 직접 파싱 시도
    if (typeof text === 'string' && text.trim().startsWith('{')) {
      try {
        const sanitized = sanitizeJsonString(text.trim());
        const parsed = JSON.parse(sanitized);
        if (parsed && parsed.text) {
          text = parsed.text;
        }
      } catch (e) {
        // 실패해도 계속 진행
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