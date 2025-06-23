import readline from 'readline';
import chalk from 'chalk';
import { t } from './i18n.js';

/**
 * Simple multiline input with backslash continuation
 * @param {string} initialPrompt - Initial prompt message  
 * @returns {Promise<string>} Multi-line input
 */
export function simpleMultilineInput(initialPrompt = '> ') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let lines = [];
    let currentPrompt = initialPrompt;

    console.log(chalk.gray(t('ui.multilineTip')));
    
    const askLine = () => {
      rl.question(currentPrompt, (input) => {
        // Handle exit commands
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          rl.close();
          resolve(null);
          return;
        }

        // Check if user wants to continue with backslash
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
      // Ensure stdin is in normal mode
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(false);
      }
    });

    rl.on('SIGINT', () => {
      console.log('\n' + chalk.yellow(t('errors.inputError')));
      rl.close();
      resolve(null);
    });

    askLine();
  });
}