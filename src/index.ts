#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import { DEFAULT_LOCALE_PATH } from './consts.js';
import {
  printCheckResults,
  printFixResults,
  printHelp,
} from './lib/printResults.js';
import {
  checkFileForPrepositionIssues,
  extractLanguageFromPath,
  fixFilePrepositionIssues,
  getRegexPatternsForLanguage,
} from './lib/processor.js';
import type { CLIOptions, Config, ProcessResult } from './types.js';
import { loadConfig } from './utils/config.js';
import {
  findJsonFiles,
  readFileContent,
  validateJsonFile,
  writeFileContent,
} from './utils/fileUtils.js';
import { getArgs } from './utils/getArgs.js';

const processFiles = async (
  options: CLIOptions,
  config: Config
): Promise<ProcessResult> => {
  const localesPath =
    options.localesPath || config.localesPath || DEFAULT_LOCALE_PATH;

  if (!localesPath) {
    throw new Error(
      'Locales path must be specified either via --locales-path flag or in config file'
    );
  }

  const absoluteLocalesPath = path.resolve(localesPath);
  const jsonFiles = findJsonFiles(absoluteLocalesPath);

  if (jsonFiles.length === 0) {
    throw new Error(
      `No JSON files found in ${absoluteLocalesPath}. ` +
        'Make sure the locales path is correct. You can:\n' +
        '• Use --locales flag to specify the path\n' +
        '• Set "localesPath" in your config file'
    );
  }

  if (!config.patterns) {
    throw new Error('No patterns configured');
  }

  const result: ProcessResult = {
    totalFiles: jsonFiles.length,
    totalErrors: 0,
    fileResults: [],
  };

  for (const filePath of jsonFiles) {
    if (!validateJsonFile(filePath)) {
      console.warn(`Warning: Skipping invalid JSON file: ${filePath}`);
      continue;
    }

    const content = readFileContent(filePath);
    const relativePath = path.relative(absoluteLocalesPath, filePath);

    // Extract language from file path and get specific patterns
    const language = extractLanguageFromPath(relativePath);

    let regexPatterns: RegExp[] = [];
    if (language) {
      regexPatterns = getRegexPatternsForLanguage(language, config.patterns);
    }

    // Skip file if no patterns found for this language
    if (regexPatterns.length === 0) {
      if (language) {
        console.warn(
          `Warning: No preposition patterns found for language '${language}' in file: ${relativePath}`
        );
      } else {
        console.warn(
          `Warning: Could not determine language from file path: ${relativePath}`
        );
      }
      continue;
    }

    const fileResult = checkFileForPrepositionIssues(
      filePath,
      relativePath,
      content,
      regexPatterns
    );

    if (options.fix && fileResult.errors.length > 0) {
      const fixedContent = fixFilePrepositionIssues(content, regexPatterns);
      writeFileContent(filePath, fixedContent);
      fileResult.fixed = true;
    }

    result.fileResults.push(fileResult);
    result.totalErrors += fileResult.errors.length;
  }

  return result;
};

const main = async (): Promise<void> => {
  try {
    const options = getArgs();

    if (options.help) {
      printHelp();
      return;
    }

    const config = loadConfig(options.config);
    const result = await processFiles(options, config);

    if (options.fix) {
      printFixResults(
        result,
        options.localesPath || config.localesPath || DEFAULT_LOCALE_PATH
      );
    } else {
      printCheckResults(
        result,
        options.localesPath || config.localesPath || DEFAULT_LOCALE_PATH
      );

      // Exit with error code if issues found in check mode
      if (result.totalErrors > 0) {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
};

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
