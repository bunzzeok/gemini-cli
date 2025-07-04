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

- Type your questions or prompts in **Korean or English**
- Press Enter to send
- Type 'exit' or 'quit' to end the session

### Single Query Mode

You can also ask a single question:

```bash
gemini "What is the capital of France?"
gemini "2024년 AI 동향 알려줘"  # Auto web search for latest info
```

### Configuration

Set your preferred language and Gemini model:

```bash
# Change language
gemini
> set language en    # English
> set language ko    # Korean

# Change Gemini model
> set model gemini-2.0-flash
> set model gemini-2.5-pro
> set model gemini-2.0-flash-lite

# View available models
> models

# View current settings
> settings
```

### Smart Web Search

The CLI automatically detects when you need web search and performs intelligent research:

```bash
gemini "Latest React 19 features"        # Auto web search
gemini "Compare Python vs JavaScript"    # Technical comparison
gemini "Current AI trends 2024"          # Latest information
```

**Auto web search triggers on:**
- Latest news/information requests
- Real-time data queries
- Product/service information
- Technical comparisons and tutorials
- Keywords like "latest", "current", "compare", etc.

### Command Reference

#### Analysis Commands
```bash
# Analyze entire project (Korean)
프로젝트 분석해줘

# Analyze entire project (English)
analyze project

# Analyze specific file
[filename] 분석해줘
[filename] analyze
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
- **Bilingual support (Korean/English)** with automatic language detection
- **Multiple Gemini models** (2.0-flash, 2.5-pro, 2.0-flash-lite, 2.5-flash)
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

### 🌐 **Intelligent Web Search**
- **Automatic web search detection** based on query intent
- Multi-step research with reflection and follow-up queries
- **Source attribution** with reliable reference links
- Optimized for both real-time information and technical queries

### ⚙️ **Customizable Settings**
- **Model selection**: Choose from multiple Gemini models
- **Language preference**: Switch between Korean and English
- **Persistent configuration** stored locally
- Easy settings management via CLI commands

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

### v1.4.0 (2025-06-23)

#### 🎯 **Major Bug Fixes & Language Improvements**
- **Fixed Language Switching Issues**
  - **Issue**: English language setting wasn't working properly - AI responses and UI messages were still in Korean
  - **Solution**: Complete overhaul of language detection system
  - **Impact**: Now when you set `set language en`, everything responds in English including:
    - AI chat responses
    - Web search results and status messages
    - All UI text and system messages

- **Improved Multiline Input System**
  - **Issue**: Character duplication and display problems after first input
  - **Solution**: Rewrote multiline input handler to fix terminal state conflicts
  - **Features**: 
    - Stable backslash (`\`) continuation method
    - Clean terminal display with proper cleanup
    - No more duplicate characters or overlapping text

- **Streamlined Text Formatting**
  - **Change**: Removed complex markdown libraries that were causing rendering issues
  - **Implementation**: Simple text formatter with chalk styling
  - **Benefits**:
    - Faster loading and better compatibility
    - Clean text output with proper alignment
    - Basic styling (bold, italic, headers) without markup artifacts
    - Consistent formatting across all responses

#### 🔧 **Technical Improvements**
- **Language System Overhaul**: Dynamic prompt generation based on current language setting
- **Internationalization**: All hardcoded text now uses i18n system
- **Dependency Optimization**: Removed `marked` and `marked-terminal` for lighter package
- **Input Stability**: Fixed readline interface conflicts and terminal state management

#### 💡 **Usage Changes**
```bash
# Language switching now works properly
> set language en
Language changed to: English
> hello
Response: Hi there! How can I help you today?

# Multiline input with backslash
> This is a long question \
... that continues on the next line \
... and finishes here

# Clean text formatting without markdown artifacts
```

### v1.3.0 (2025-06-23)

#### 🚀 **Major New Features**
- **Intelligent Web Search Integration**
  - **Automatic intent detection**: AI automatically determines when web search is needed
  - **Multi-step research**: Generates multiple search queries and performs follow-up searches
  - **Source attribution**: Provides reliable references with clean formatting
  - **Optimized performance**: Reduced token costs with efficient English prompts

- **Bilingual Support System**
  - **Language switching**: `set language ko|en` to switch between Korean and English
  - **Localized help**: Dynamic help text based on selected language
  - **Persistent settings**: Language preference saved across sessions

- **Multiple Gemini Model Support**
  - **Model selection**: Choose from gemini-2.0-flash, gemini-2.5-pro, gemini-2.0-flash-lite, gemini-2.5-flash
  - **Easy switching**: `set model [model-name]` command
  - **Model information**: `models` command to view all available models with descriptions
  - **Unified configuration**: Model settings apply to both chat and web search

#### ⚙️ **Settings Management**
- **New commands**:
  - `settings` - View current configuration
  - `models` - List all available Gemini models with descriptions
  - `set model [model]` - Change Gemini model
  - `set language [ko|en]` - Change interface language
- **Persistent storage**: Settings saved in `config.json`
- **Smart defaults**: Fallback to sensible defaults if config missing

#### 🎨 **Improved User Experience**
- **Enhanced search results**: Beautiful formatted output with bordered sections
- **Reduced verbosity**: Cleaner progress indicators and status messages
- **Better error handling**: More informative error messages in user's preferred language
- **Optimized performance**: 50% reduction in API calls through simplified reflection logic

#### 🔧 **Technical Improvements**
- **Token optimization**: English prompts reduce costs by 80%
- **Modular architecture**: Separated settings, i18n, and configuration management
- **Type safety**: Better error handling and validation
- **Future-ready**: Extensible framework for additional languages and models

### v1.2.1 (2025-06-19)

#### 🐛 **Bug Fixes**
- **Fixed backup file path structure issue**
  - **Problem**: Backup files were ignoring the original file's path structure and being stored in the root backup folder
  - **Solution**: Modified backup creation to maintain the original file's directory structure within the backup folder
  - **Example**: 
    - Before: `src/app.js` → `backup/app.js.timestamp.backup`
    - After: `src/app.js` → `backup/src/app.js.timestamp.backup`
- **Fixed root directory configuration issue**
  - **Problem**: Backup files were being created in the Gemini CLI project root instead of the execution location
  - **Solution**: Changed `rootDir` to current working directory (`process.cwd()`) to create backups in the execution location
  - **Example**: 
    - Before: `vocatrain-v2-FE/src/app.js` → `gemini-cli/backup/...`
    - After: `vocatrain-v2-FE/src/app.js` → `vocatrain-v2-FE/backup/...`

#### 🚀 **New Features**
- **Added `tree` command for project structure visualization**
  - **Feature**: Visualize project directory structure in tree format
  - **Usage**: Use `tree` command to view current project's file/folder structure
  - **Benefits**: Easy identification of exact file paths for modifications
  - **Features**:
    - Color-coded directories and files
    - File extension-based color coding (JS/TS: yellow, JSON/MD: green, CSS: magenta, etc.)
    - Smart filtering (excludes `node_modules`, `.git`, `backup`, etc.)
    - Alphabetical sorting (directories first)

- **Enhanced README generation with project analysis**
  - **Feature**: Automatically generate customized README based on project structure analysis
  - **Improvement**: Creates new files with date stamps instead of overwriting existing README
  - **Analysis**: Provides project structure and package.json information to AI for accurate README generation
  - **Output**: Generates files in `README-2024-01-15.md` format

#### 🔧 **Backup System Improvements**
- **Enhanced backup list display**
  - Backup file listing now searches only within backup folder (removed full project search)
  - Added original file path location information for backup files
  - Clearer backup path display (`backup/src/app.js.timestamp.backup`)

- **Improved backup cleanup functionality**
  - **Change**: `backup cleanup` command now deletes all files within backup folder
  - **Before**: Deleted only backups older than 30 days (selective deletion)
  - **After**: Complete deletion of all files within backup folder
  - **Safety**: Recursive deletion ensures all subdirectories are cleaned

- **Improved backup management**
  - `listBackups()` function now properly handles nested backup directory structures
  - Enhanced path matching for backup restoration
  - Improved backup completion messages (relative path display)

#### 📚 **Documentation Updates**
- **Updated help command**
  - Added `tree` command
  - Improved command categorization (Analysis, Modification, Documentation, Backup Management, Other)
  - Clearer command descriptions

#### 🎯 **User Experience Improvements**
- **Better file path handling**
  - Backup creation based on execution directory
  - Independent backup management per project
  - Intuitive file path display

- **Enhanced project analysis**
  - README generation based on actual project structure analysis
  - Accurate technology stack information using package.json data

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
