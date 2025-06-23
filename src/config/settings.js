import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(path.resolve(__dirname, "../.."), "config.json");

// Default settings
const defaultSettings = {
  model: "gemini-2.0-flash",
  language: "ko", // ko | en
  webSearchModel: "gemini-2.0-flash",
  temperature: 0.7
};

/**
 * Load user settings
 */
export function loadSettings() {
  try {
    if (fs.existsSync(configPath)) {
      const settings = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return { ...defaultSettings, ...settings };
    }
  } catch (error) {
    console.warn('Failed to load settings, using defaults');
  }
  return defaultSettings;
}

/**
 * Save user settings
 */
export function saveSettings(settings) {
  try {
    const currentSettings = loadSettings();
    const newSettings = { ...currentSettings, ...settings };
    fs.writeFileSync(configPath, JSON.stringify(newSettings, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error.message);
    return false;
  }
}

/**
 * Get available models with descriptions
 */
export function getAvailableModels() {
  return {
    "gemini-2.0-flash": {
      name: "gemini-2.0-flash",
      description: "Latest multimodal model, fast responses, good for general use",
      capabilities: ["Text", "Images", "Code", "Web Search"]
    },
    "gemini-2.0-flash-lite": {
      name: "gemini-2.0-flash-lite",
      description: "Lightweight version, faster and more cost-effective",
      capabilities: ["Text", "Code", "Quick responses"]
    },
    "gemini-2.5-pro": {
      name: "gemini-2.5-pro",
      description: "Most advanced model, best for complex reasoning tasks",
      capabilities: ["Advanced reasoning", "Complex analysis", "Research"]
    },
    "gemini-2.5-flash": {
      name: "gemini-2.5-flash",
      description: "Latest fast model with enhanced capabilities",
      capabilities: ["Text", "Images", "Code", "Fast processing"]
    }
  };
}

/**
 * Get available model names only
 */
export function getAvailableModelNames() {
  return Object.keys(getAvailableModels());
}

/**
 * Get available languages
 */
export function getAvailableLanguages() {
  return {
    "ko": "한국어",
    "en": "English"
  };
}