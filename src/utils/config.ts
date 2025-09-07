import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PREPOSITIONS } from '../consts.js';
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

  // Apply defaults
  if (!config.prepositions) {
    config.prepositions = DEFAULT_PREPOSITIONS;
  } else {
    // Merge with defaults for standard languages, keep custom languages as is
    config.prepositions = {
      ...config.prepositions,
      en: config.prepositions.en || DEFAULT_PREPOSITIONS.en,
      ru: config.prepositions.ru || DEFAULT_PREPOSITIONS.ru,
      uk: config.prepositions.uk || DEFAULT_PREPOSITIONS.uk,
    };
  }

  return config;
};

export const createRegExp = (prepositions: string[]): RegExp => {
  const prepositionGroup = prepositions.join('|');
  // Match prepositions followed by regular space but not by non-breaking space
  return new RegExp(`\\b(${prepositionGroup}) (?!\\u00A0)`, 'gi');
};
