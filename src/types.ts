export interface PrepositionPatterns {
  en: string[];
  ru: string[];
  uk: string[];
}

export interface Config {
  prepositions?: PrepositionPatterns;
  localesPath?: string;
}

export interface CLIOptions {
  check: boolean;
  fix: boolean;
  config?: string;
  localesPath?: string;
  help: boolean;
}

export interface ProcessResult {
  totalFiles: number;
  totalErrors: number;
  fileResults: FileResult[];
}

export interface FileResult {
  filePath: string;
  relativePath: string;
  errors: LineError[];
  fixed?: boolean;
}

export interface LineError {
  lineNumber: number;
  content: string;
  preposition: string;
}
