import path from 'node:path';
import { CONSOLE_COLORS } from '../consts.js';
import type { ProcessResult } from '../types.js';

export const printCheckResults = (
  result: ProcessResult,
  baseDir: string
): void => {
  const { BOLD, RESET, YELLOW, RED, GREEN, CYAN } = CONSOLE_COLORS;

  console.log(
    `${BOLD}${CYAN}Checking prepositions in locale files...${RESET}\n`
  );

  for (const fileResult of result.fileResults) {
    const relativePath = path.relative(baseDir, fileResult.filePath);
    console.log(`${BOLD}${YELLOW}Checking file: ${relativePath}${RESET}`);

    if (fileResult.errors.length > 0) {
      for (const error of fileResult.errors) {
        console.log(`${YELLOW}${error.lineNumber}: ${error.content}${RESET}`);
      }
      console.error(
        `${BOLD}${RED}Found ${fileResult.errors.length} line(s) with preposition issues in ${relativePath}${RESET}\n`
      );
    } else {
      console.log(
        `${BOLD}${GREEN}No preposition issues found in ${relativePath}${RESET}\n`
      );
    }
  }

  if (result.totalErrors > 0) {
    console.error(
      `${BOLD}${RED}Total ${result.totalErrors} line(s) with preposition issues across ${result.totalFiles} files.${RESET}`
    );
    console.error(
      `${YELLOW}Tip: Replace regular spaces after prepositions with non-breaking spaces (\\u00A0)${RESET}`
    );
    console.error(
      `${YELLOW}Run with --fix flag to automatically fix these issues.${RESET}`
    );
  } else {
    console.log(
      `${BOLD}${GREEN}✅ No preposition issues found in ${result.totalFiles} files!${RESET}`
    );
  }
};

export const printFixResults = (
  result: ProcessResult,
  baseDir: string
): void => {
  const { BOLD, RESET, YELLOW, GREEN, CYAN, BLUE } = CONSOLE_COLORS;

  console.log(
    `${BOLD}${CYAN}Fixing preposition issues in locale files...${RESET}\n`
  );

  let fixedFiles = 0;
  let totalFixed = 0;

  for (const fileResult of result.fileResults) {
    const relativePath = path.relative(baseDir, fileResult.filePath);

    if (fileResult.errors.length > 0) {
      console.log(
        `${BOLD}${BLUE}Fixed ${fileResult.errors.length} issue(s) in: ${relativePath}${RESET}`
      );
      fixedFiles++;
      totalFixed += fileResult.errors.length;
    }
  }

  if (totalFixed > 0) {
    console.log(
      `\n${BOLD}${GREEN}✅ Successfully fixed ${totalFixed} preposition issue(s) in ${fixedFiles} file(s).${RESET}`
    );
  } else {
    console.log(`${BOLD}${YELLOW}No preposition issues found to fix.${RESET}`);
  }
};

export const printHelp = (): void => {
  const { BOLD, RESET, CYAN, YELLOW, GREEN } = CONSOLE_COLORS;

  console.log(
    `${BOLD}${CYAN}i18n-nbsp${RESET} - Non-breaking space fixer for i18n JSON files\n`
  );

  console.log(`${BOLD}Usage:${RESET}`);
  console.log(`  i18n-nbsp [options] [locales-path]\n`);

  console.log(`${BOLD}Options:${RESET}`);
  console.log(
    `  ${YELLOW}--check${RESET}               Check for preposition issues (default mode)`
  );
  console.log(
    `  ${YELLOW}--fix${RESET}                 Fix preposition issues by adding non-breaking spaces`
  );
  console.log(
    `  ${YELLOW}--locales${RESET}             Path to locales directory`
  );
  console.log(`  ${YELLOW}--config${RESET}              Path to config file`);
  console.log(
    `  ${YELLOW}-h, --help${RESET}            Show this help message`
  );

  console.log(`${BOLD}Examples:${RESET}`);
  console.log(
    `  ${GREEN}i18n-nbsp ./locales${RESET}                    # Check for issues`
  );
  console.log(
    `  ${GREEN}i18n-nbsp --fix ./locales${RESET}              # Fix issues`
  );
  console.log(
    `  ${GREEN}i18n-nbsp --config ./custom.json ./locales${RESET}  # Use custom config\n`
  );
};
