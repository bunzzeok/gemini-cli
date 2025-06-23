import readline from 'readline';
import chalk from 'chalk';
import { t } from './i18n.js';

/**
 * Multi-line input handler with Shift+Enter support
 * @param {string} prompt - Initial prompt message
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} The collected multi-line input
 */
export function multilineInput(prompt = '> ', options = {}) {
  return new Promise((resolve) => {
    const {
      continuationPrompt = '... ',
      submitHint = chalk.gray('(Press Enter to submit, Shift+Enter for new line)'),
      cancelHint = chalk.gray('(Type "exit" or "quit" to cancel)')
    } = options;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: prompt
    });

    let lines = [];
    let isFirstLine = true;

    // Show initial hints
    if (isFirstLine) {
      console.log(submitHint);
      console.log(cancelHint);
    }

    rl.on('line', (input) => {
      // Check for exit commands
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        rl.close();
        resolve(null);
        return;
      }

      // Add current line to collection
      lines.push(input);

      // Check if this is a continuation (Shift+Enter simulation)
      // In terminal, we simulate this by checking if line ends with backslash
      // or if the line is empty and we want to continue
      const shouldContinue = input.endsWith('\\') || (input.trim() === '' && lines.length === 1);

      if (shouldContinue) {
        // Remove trailing backslash if present
        if (input.endsWith('\\')) {
          lines[lines.length - 1] = input.slice(0, -1);
        }
        
        // Set continuation prompt
        rl.setPrompt(continuationPrompt);
        rl.prompt();
        isFirstLine = false;
      } else {
        // Submit the multi-line input
        rl.close();
        const result = lines.join('\n').trim();
        resolve(result || null);
      }
    });

    rl.on('close', () => {
      if (lines.length === 0) {
        resolve(null);
      }
    });

    // Handle Ctrl+C gracefully
    rl.on('SIGINT', () => {
      console.log('\n' + chalk.yellow('입력이 취소되었습니다.'));
      rl.close();
      resolve(null);
    });

    // Start the prompt
    rl.setPrompt(prompt);
    rl.prompt();
  });
}

/**
 * Enhanced readline interface with better multi-line support
 * @param {Object} options - Configuration options
 * @returns {Object} Enhanced readline interface
 */
export function createMultilineInterface(options = {}) {
  const {
    input = process.stdin,
    output = process.stdout,
    prompt = '> ',
    continuationPrompt = '... '
  } = options;

  const rl = readline.createInterface({
    input,
    output,
    prompt
  });

  let isMultilineMode = false;
  let multilineBuffer = [];

  // Override the default line handler
  const originalPrompt = rl.prompt.bind(rl);
  
  rl.showMultilineHelp = () => {
    console.log(chalk.gray('다음 키보드 단축키를 사용할 수 있습니다:'));
    console.log(chalk.gray('  Enter: 메시지 전송'));
    console.log(chalk.gray('  \\: 줄 끝에 추가하고 Enter를 눌러 다음 줄로 이동'));
    console.log(chalk.gray('  Ctrl+C: 현재 입력 취소'));
    console.log(chalk.gray('  exit/quit: 프로그램 종료'));
    console.log();
  };

  rl.startMultilineInput = () => {
    isMultilineMode = true;
    multilineBuffer = [];
    rl.setPrompt(continuationPrompt);
  };

  rl.endMultilineInput = () => {
    isMultilineMode = false;
    multilineBuffer = [];
    rl.setPrompt(prompt);
  };

  rl.getMultilineBuffer = () => {
    return multilineBuffer.join('\n');
  };

  rl.isInMultilineMode = () => {
    return isMultilineMode;
  };

  return rl;
}

/**
 * Simple multi-line input with backslash continuation
 * @param {string} initialPrompt - Initial prompt
 * @returns {Promise<string>} Multi-line input
 */
export function simpleMultilineInput(initialPrompt = '> ') {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let lines = [];
    let currentPrompt = initialPrompt;
    let isFirstTime = true;

    // Show hint only on first input
    if (isFirstTime) {
      console.log(chalk.gray('Press Shift+Enter for new line, Enter to submit'));
      isFirstTime = false;
    }
    
    const askLine = () => {
      rl.question(currentPrompt, (input) => {
        // Handle exit commands
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          rl.close();
          resolve(null);
          return;
        }

        // Check if user wants to continue (simulate Shift+Enter with backslash for now)
        if (input.endsWith('\\')) {
          // Continue to next line
          lines.push(input.slice(0, -1)); // Remove trailing backslash
          currentPrompt = '... ';
          askLine();
        } else {
          // Finish input
          lines.push(input);
          rl.close();
          resolve(lines.join('\n').trim() || null);
        }
      });
    };

    // Handle cleanup
    rl.on('close', () => {
      // Reset stdin to normal mode if it was in raw mode
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(false);
      }
    });

    rl.on('SIGINT', () => {
      console.log('\n' + chalk.yellow('Input cancelled.'));
      rl.close();
      resolve(null);
    });

    askLine();
  });
}