#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {
  printCheckResults,
  printFixResults,
  printHelp,
} from './lib/printResults.js';
import {
  checkFileForPrepositionIssues,
  fixFilePrepositionIssues,
  getRegexPatternsForLanguages,
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
  const localesPath = options.localesPath || config.localesPath || './locales';

  if (!localesPath) {
    throw new Error(
      'Locales path must be specified either via --locales-path flag or in config file'
    );
  }

  const absoluteLocalesPath = path.resolve(localesPath);
  const jsonFiles = findJsonFiles(absoluteLocalesPath);

  if (jsonFiles.length === 0) {
    throw new Error(`No JSON files found in ${absoluteLocalesPath}`);
  }

  if (!config.prepositions) {
    throw new Error('No prepositions configured');
  }

  const regexPatterns = getRegexPatternsForLanguages(config.prepositions);
  const result: ProcessResult = {
    totalFiles: jsonFiles.length,
    totalErrors: 0,
    fileResults: [],
  };

  for (const filePath of jsonFiles) {
    // Validate JSON first
    if (!validateJsonFile(filePath)) {
      console.warn(`Warning: Skipping invalid JSON file: ${filePath}`);
      continue;
    }

    const content = readFileContent(filePath);
    const relativePath = path.relative(absoluteLocalesPath, filePath);

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
        options.localesPath || config.localesPath || './locales'
      );
    } else {
      printCheckResults(
        result,
        options.localesPath || config.localesPath || './locales'
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
