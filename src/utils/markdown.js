import chalk from 'chalk';

/**
 * Simple text formatter without markdown dependencies
 * @param {string} text - Text to format
 * @returns {string} Formatted text with proper alignment
 */
export function smartFormat(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  try {
    // Apply simple text formatting
    let formatted = text;
    
    // Clean up extra whitespace and normalize line breaks
    formatted = formatted
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with 2
      .replace(/^\s+|\s+$/g, '')  // Trim leading/trailing whitespace
      .replace(/[ \t]+$/gm, '');  // Remove trailing spaces from lines
    
    // Apply basic text styling with chalk
    formatted = formatted
      // Bold text (keep simple ** markers visible)
      .replace(/\*\*(.*?)\*\*/g, (match, content) => chalk.bold(content))
      // Italic text (keep simple * markers visible)  
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, (match, content) => chalk.italic(content))
      // Code blocks (keep ` markers visible)
      .replace(/`([^`]+)`/g, (match, content) => chalk.yellow(content))
      // Headers (# markers)
      .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
        return chalk.cyan.bold(content);
      });
    
    // Improve readability with proper spacing
    const lines = formatted.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      
      // Add line to output
      processedLines.push(line);
      
      // Add spacing after headers and before new sections
      if (line.trim() && nextLine && nextLine.trim() && 
          (line.match(/^\d+\./) || line.match(/^[•\-\*]/))) {
        // Don't add extra space for list items
      } else if (line.trim() && nextLine && nextLine.trim() && i < lines.length - 1) {
        // Add space between paragraphs but not at the end
        if (!line.match(/^[\s]*$/) && !nextLine.match(/^[\s\-=]{3,}$/)) {
          // Don't add space before lines that are clearly continuations
          if (!nextLine.match(/^[\s]*[•\-\*\d]/)) {
            processedLines.push('');
          }
        }
      }
    }
    
    return processedLines.join('\n');
    
  } catch (error) {
    console.error('Text formatting failed:', error);
    return text;
  }
}

/**
 * Format text with consistent indentation and alignment
 * @param {string} text - Text to align
 * @param {number} indent - Number of spaces to indent
 * @returns {string} Aligned text
 */
export function alignText(text, indent = 0) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const indentStr = ' '.repeat(indent);
  return text
    .split('\n')
    .map(line => line.trim() ? indentStr + line : line)
    .join('\n');
}

/**
 * Create a simple text box around content
 * @param {string} content - Content to box
 * @param {string} title - Optional title
 * @returns {string} Boxed content
 */
export function createTextBox(content, title = '') {
  const lines = content.split('\n');
  const maxLength = Math.max(...lines.map(line => line.length), title.length);
  const width = Math.min(maxLength + 4, 80);
  
  const topBorder = '┌' + '─'.repeat(width - 2) + '┐';
  const bottomBorder = '└' + '─'.repeat(width - 2) + '┘';
  const titleLine = title ? `│ ${chalk.bold(title)}${' '.repeat(width - title.length - 3)}│` : '';
  
  const contentLines = lines.map(line => {
    const paddedLine = line + ' '.repeat(width - line.length - 3);
    return `│ ${paddedLine}│`;
  });
  
  const result = [
    topBorder,
    ...(titleLine ? [titleLine, '├' + '─'.repeat(width - 2) + '┤'] : []),
    ...contentLines,
    bottomBorder
  ].join('\n');
  
  return chalk.gray(result);
}

// Export aliases for backward compatibility
export const renderMarkdownToTerminal = smartFormat;
export const isMarkdown = () => false; // Always return false since we're not using markdown