# Gemini CLI

A command-line interface tool for interacting with Google's Gemini AI.

## Installation

```bash
npm install -g briggs-gemini-cli
```

## First-time Setup

When you run the `gemini` command for the first time, you'll be prompted to enter your Gemini API key. You can get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## Usage

### Interactive Mode

Simply run:
```bash
gemini
```

This will start an interactive chat session with Gemini AI. You can:
- Type your questions or prompts
- Press Enter to send
- Type 'exit' or 'quit' to end the session

### Single Query Mode

You can also ask a single question:
```bash
gemini "What is the capital of France?"
```

## Features

- Interactive chat interface
- Support for both Windows and macOS
- Secure API key storage
- Real-time AI responses
- Simple and intuitive usage
- Project code analysis
- Code modification capabilities
- Korean language support

## Requirements

- Node.js version 20 or higher
- A Gemini API key from Google AI Studio

## Notes

- Your API key is stored locally in a `.env` file
- The key is never shared or transmitted to any external services
- The tool works offline once the API key is configured

## Changelog

### v1.1.5 (2025-06-18)
- Backup Path Storage Enhancement
  - Added configurable backup directory path variable
  - Users can now customize backup file storage location
  - Improved backup file organization and management
  - Enhanced backup path validation and error handling

### v1.1.4 (2025-06-18)
- Major Error Handling Improvements
  - Enhanced try-catch blocks across all functions
  - Added specific error messages for network and API key issues
  - User-friendly error guidance with recovery suggestions
- File Path Processing Enhancements
  - Automatic absolute/relative path resolution
  - Smart file extension detection (.js, .ts, .jsx, etc.)
  - Similar filename suggestions when file not found
  - Pre-validation of file existence
- API Response Stability
  - Robust JSON parsing with fallback mechanisms
  - Code block extraction for malformed responses
  - Response structure validation
- User Experience Improvements
  - Progress indicators and status messages
  - Automatic backup file generation with timestamps
  - Clear success/failure feedback
  - Graceful error recovery without program termination

### v1.1.3 (2025-06-17)
- Project Analysis Improvements
  - Fixed duplicate output issue in analysis results
  - Enhanced file path recognition
  - Improved analysis result formatting
- Code Modification Enhancements
  - Added common file modification request mappings
  - Improved file path resolution logic
- Code Structure Improvements
  - Modular separation by functionality
  - Enhanced error handling
  - Improved code readability

### v1.0.28 (2025-06-17)
- Initial Release
  - Basic CLI functionality
  - Gemini AI integration
  - Project analysis feature
  - Code modification feature

## License

MIT
