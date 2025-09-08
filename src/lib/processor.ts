import path from 'node:path';
import { NON_BREAKING_SPACE } from '../consts.js';
import type { FileResult, LineError } from '../types.js';
import { createRegExp } from '../utils/config.js';

export const checkFileForPrepositionIssues = (
  filePath: string,
  relativePath: string,
  content: string,
  regexPatterns: RegExp[]
): FileResult => {
  const lines = content.split(/\r?\n/);
  const errors: LineError[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    for (const pattern of regexPatterns) {
      let match: RegExpExecArray | null;
      // Reset regex state
      pattern.lastIndex = 0;

      match = pattern.exec(line);
      while (match !== null) {
        if (match[1]) {
          errors.push({
            lineNumber: i + 1,
            content: line.trim(),
            preposition: match[1],
          });
        }
        match = pattern.exec(line);
      }
    }
  }

  return {
    filePath,
    relativePath,
    errors,
  };
};

export const fixFilePrepositionIssues = (
  content: string,
  regexPatterns: RegExp[]
): string => {
  let fixedContent = content;

  for (const pattern of regexPatterns) {
    // Reset the regex state before each use
    pattern.lastIndex = 0;

    fixedContent = fixedContent.replace(
      pattern,
      (_match: string, preposition: string) => {
        // Replace the specific space after preposition with non-breaking space
        // The regex pattern is: \b(preposition) (?!\u00A0)
        // So we replace "preposition " with "preposition\u00A0"
        return `${preposition}${NON_BREAKING_SPACE}`;
      }
    );
  }

  return fixedContent;
};

export const getRegexPatternsForLanguage = (
  language: string,
  patterns: { [language: string]: string[] | null }
): RegExp[] => {
  // Always use base language (e.g., "de" for "de-CH", "en" for "en-AU")
  const baseLanguage = language.split('-')[0];
  if (!baseLanguage) return [];

  const match = patterns[baseLanguage];
  if (match && Array.isArray(match) && match.length > 0) {
    return [createRegExp(match)];
  }

  // No patterns found for this language
  return [];
};

export const extractLanguageFromPath = (
  relativePath: string
): string | null => {
  // Extract language from paths like "de-CH/common.json" or "en/translation.json"
  const parts = relativePath.split(path.sep);
  if (parts.length === 0) return null;

  const languageCandidate = parts[0];
  if (!languageCandidate) return null;

  // Basic validation - should look like language code (standard or custom)
  // Allow: en, en-US, klingon, elvish, etc.
  if (/^[a-z]{2,}(-[A-Z]{2,})?$/i.test(languageCandidate)) {
    return languageCandidate;
  }

  return null;
};
