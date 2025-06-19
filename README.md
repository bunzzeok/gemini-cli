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

### Command Reference

#### Analysis Commands
```bash
# Analyze entire project
프로젝트 분석해줘

# Analyze specific file
[filename] 분석해줘
```

#### Code Modification
```bash
# Modify specific file
[filename] 수정해줘

# Example: Add comments to a function
app.js 수정해줘 - 모든 함수에 주석 추가해줘
```

#### Backup Management
```bash
# List all backup files
backup list

# Restore from backup
backup restore [backup-filename]

# Clean old backups
backup cleanup
```

#### Help and Documentation
```bash
# Show help
help

# Generate README
README 작성해줘
```

### Example Workflows

#### 1. Project Analysis Workflow
```bash
gemini
> 프로젝트 분석해줘
> src/app.js 분석해줘
> README 작성해줘
```

#### 2. Code Modification Workflow
```bash
gemini
> src/utils.js 수정해줘 - 에러 핸들링 추가해줘
> backup list
> 수정 내용이 마음에 들지 않으면: backup restore utils.js.2024-01-15T10-30-00-000Z.backup
```

## Features

### 🤖 **AI Chat Interface**
- Interactive chat session with Gemini AI
- Single query mode for one-off questions
- Korean language support with friendly interface
- Real-time AI responses with loading animations

### 📊 **Project Analysis**
- **Full project analysis**: Scans entire project directory structure
- **Individual file analysis**: Analyzes specific code files
- Excludes common directories (`node_modules`, `.git`, `backup`, `dist`, `build`)
- Supports multiple file types (`.js`, `.ts`, `.jsx`, `.tsx`, `.json`, `.md`, `.py`, `.java`, `.c`, `.cpp`, etc.)
- Provides detailed insights about code structure and architecture

### ✏️ **Code Modification**
- AI-powered code modification based on natural language requests
- Smart file path resolution (handles both absolute and relative paths)
- File extension auto-detection
- Context-aware modifications using project analysis

### 🛡️ **Security Features**
- Path traversal attack prevention
- File extension validation
- File size limits (10MB max)
- Input sanitization and validation
- Secure API key storage

### 💾 **Advanced Backup System**
- **Automatic backup**: Creates timestamped backups before modifications
- **Backup management**: View, restore, and cleanup backup files
- **Restore functionality**: Restore from any backup with safety checks
- **Cleanup tools**: Remove old backups automatically (30-day retention)

### 🎯 **Command System**
- **Help system**: Built-in help and command discovery
- **Backup commands**: 
  - `backup list` - View all backup files
  - `backup restore [filename]` - Restore from backup
  - `backup cleanup` - Clean old backups
- **Analysis commands**: Project and file analysis
- **Modification commands**: Natural language code editing

### 🔧 **Developer Experience**
- Support for both Windows and macOS
- Smart error handling with helpful suggestions
- Progress indicators and status messages
- Automatic file extension detection
- Similar filename suggestions when files not found

## Requirements

- Node.js version 20 or higher
- A Gemini API key from Google AI Studio

## Notes

- Your API key is stored locally in a `.env` file
- The key is never shared or transmitted to any external services
- The tool works offline once the API key is configured

## Changelog

### v1.1.8 (2025-06-19)

#### 🚀 **Major Architecture Improvements**
- **Service Layer Refactoring**
  - Created `ChatService` for centralized AI communication
  - Separated UI utilities (`src/utils/ui.js`) for better code organization
  - Moved formatting logic to dedicated utility (`src/utils/formatting.js`)
  - Eliminated duplicate code across CLI and service modules

#### 🛡️ **Security Enhancements**
- **Added comprehensive security validation** (`src/utils/security.js`):
  - Path traversal attack prevention with `validateAndNormalizePath()`
  - File extension whitelist validation
  - File size limits (10MB maximum)
  - Input sanitization to prevent malicious input
- **Enhanced file access controls** across all services

#### 💾 **Advanced Backup System**
- **Complete backup management system**:
  - `listBackups()` - View all backup files with metadata
  - `restoreFromBackup()` - Restore files with pre-restore safety backup
  - `cleanupBackups()` - Automatic cleanup of old backups (30-day retention)
- **Smart backup features**:
  - Timestamped backup files
  - Backup rotation and size management
  - Restore history tracking

#### 🎯 **Enhanced Command System**
- **Built-in help system** with comprehensive command documentation
- **Extended backup commands**:
  - `backup list` - Show all available backups
  - `backup restore [filename]` - Restore from specific backup
  - `backup cleanup` - Clean old backup files
- **Improved command parsing** with better error handling

#### 🔧 **Developer Experience**
- **Dependencies Management**: Added missing packages (`chalk`, `express`, `cors`)
- **Error Handling**: Centralized error display with user-friendly messages
- **Code Quality**: Removed duplicate logic and improved maintainability
- **Performance**: Optimized file operations and memory usage

#### 🏗️ **Breaking Changes**
- Refactored CLI entry point for better modularity
- Service interfaces standardized across all modules
- Enhanced security may block previously accessible files outside project directory

### v1.1.7 (2025-06-19)

- Code Quality and Structure Improvements
  - Refactored core modules for better maintainability
  - Enhanced error handling across all service layers
  - Updated file processing logic and path resolution
  - Improved code organization and modularity
- Configuration Updates
  - Updated package.json dependencies and metadata
  - Enhanced build scripts and setup procedures
  - Improved .gitignore configuration
- Bug Fixes and Optimizations
  - Fixed various edge cases in file operations
  - Enhanced backup system reliability
  - Improved CLI command handling and response formatting

### v1.1.6 (2025-06-18)

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
