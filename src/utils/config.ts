import fs from 'node:fs';
import path from 'node:path';
import defaultConfigJson from '../../i18n-nbsp.config.json' with {
  type: 'json',
};
import { DEFAULT_LOCALE_PATH } from '../consts.js';
import type { Config } from '../types.js';

export const loadConfig = (configPath?: string): Config => {
  let config: Config = {};

  // If config path is specified, try to load it
  if (configPath) {
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(configContent);
      } catch (error) {
        console.warn(
          `Warning: Could not parse config file ${configPath}:`,
          error
        );
      }
    } else {
      console.warn(`Warning: Config file not found: ${configPath}`);
    }
  } else {
    // Try to find default config in current directory
    const defaultConfigPath = path.join(process.cwd(), 'i18n-nbsp.config.json');
    if (fs.existsSync(defaultConfigPath)) {
      try {
        const configContent = fs.readFileSync(defaultConfigPath, 'utf-8');
        config = JSON.parse(configContent);
      } catch (error) {
        console.warn(
          `Warning: Could not parse config file ${defaultConfigPath}:`,
          error
        );
      }
    }
  }

  // Apply defaults - merge user config with defaults from i18n-nbsp.config.json
  config.localesPath = config.localesPath || DEFAULT_LOCALE_PATH;

  // Merge patterns with special handling for null values (which disable languages)
  const mergedPatterns: { [language: string]: string[] } = {
    ...defaultConfigJson.patterns,
  };
  if (config.patterns) {
    for (const [language, patterns] of Object.entries(config.patterns)) {
      if (patterns === null) {
        // null disables the language
        delete mergedPatterns[language];
      } else {
        // Replace default patterns for this language
        mergedPatterns[language] = patterns;
      }
    }
  }
  config.patterns = mergedPatterns;

  return config;
};

export const createRegExp = (prepositions: string[]): RegExp => {
  const prepositionGroup = prepositions.join('|');
  // Match prepositions followed by regular space but not by non-breaking space
  return new RegExp(`\\b(${prepositionGroup}) (?!\\u00A0)`, 'gi');
};
