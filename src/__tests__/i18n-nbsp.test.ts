import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { runI18nNbsp } from './runI18nNbsp.js';

const TEST_DIR = 'src/__tests__/fixtures/locales';
const CONFIG_FILE = 'src/__tests__/fixtures/test-config.json';
const CUSTOM_TEST_DIR = 'src/__tests__/fixtures/custom-locales';
const CUSTOM_CONFIG_FILE = 'src/__tests__/fixtures/custom-lang-config.json';

// Store original fixture contents to restore after tests
let originalFixtures: {
  en: string;
  ru: string;
  uk: string;
  klingon: string;
  elvish: string;
};

const backupOriginalFixtures = (): void => {
  const enFile = path.join(TEST_DIR, 'en', 'common.json');
  const ruFile = path.join(TEST_DIR, 'ru', 'common.json');
  const ukFile = path.join(TEST_DIR, 'uk', 'common.json');
  const klingonFile = path.join(CUSTOM_TEST_DIR, 'klingon', 'common.json');
  const elvishFile = path.join(CUSTOM_TEST_DIR, 'elvish', 'common.json');

  originalFixtures = {
    en: fs.readFileSync(enFile, 'utf-8'),
    ru: fs.readFileSync(ruFile, 'utf-8'),
    uk: fs.readFileSync(ukFile, 'utf-8'),
    klingon: fs.readFileSync(klingonFile, 'utf-8'),
    elvish: fs.readFileSync(elvishFile, 'utf-8'),
  };
};

const restoreOriginalFixtures = (): void => {
  const enFile = path.join(TEST_DIR, 'en', 'common.json');
  const ruFile = path.join(TEST_DIR, 'ru', 'common.json');
  const ukFile = path.join(TEST_DIR, 'uk', 'common.json');
  const klingonFile = path.join(CUSTOM_TEST_DIR, 'klingon', 'common.json');
  const elvishFile = path.join(CUSTOM_TEST_DIR, 'elvish', 'common.json');

  fs.writeFileSync(enFile, originalFixtures.en);
  fs.writeFileSync(ruFile, originalFixtures.ru);
  fs.writeFileSync(ukFile, originalFixtures.uk);
  fs.writeFileSync(klingonFile, originalFixtures.klingon);
  fs.writeFileSync(elvishFile, originalFixtures.elvish);
};

describe('i18n-nbsp CLI tool', () => {
  beforeAll(() => {
    backupOriginalFixtures();
  });

  afterEach(() => {
    restoreOriginalFixtures();
  });

  test('should show help when --help flag is used', () => {
    const result = runI18nNbsp(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('i18n-nbsp - Non-breaking space fixer');
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('Options:');
    expect(result.stdout).toContain('Examples:');
  });

  test('should detect preposition issues in check mode', () => {
    const result = runI18nNbsp(['--check', TEST_DIR]);

    expect(result.exitCode).toBe(1); // Should exit with error when issues found
    expect(result.stdout).toContain('Checking prepositions in locale files');
    // Should detect issues - check for specific lines or patterns
    expect(result.stdout).toContain('common.json');
    expect(result.stdout).toMatch(/\d+:/); // Should contain line numbers with findings
  });

  test('should fix preposition issues in fix mode', () => {
    // First check that issues exist
    const checkResult = runI18nNbsp(['--check', TEST_DIR]);
    expect(checkResult.exitCode).toBe(1);

    // Fix the issues
    const fixResult = runI18nNbsp(['--fix', TEST_DIR]);
    expect(fixResult.exitCode).toBe(0);
    expect(fixResult.stdout).toContain('Fixing preposition issues');
    expect(fixResult.stdout).toContain('Successfully fixed');

    // Verify issues are fixed
    const verifyResult = runI18nNbsp(['--check', TEST_DIR]);
    expect(verifyResult.exitCode).toBe(0);
    expect(verifyResult.stdout).toContain('No preposition issues found');
  });

  test('should work with custom config file', () => {
    const result = runI18nNbsp(['--config', CONFIG_FILE, '--check', TEST_DIR]);

    expect(result.exitCode).toBe(1); // Should find issues with custom config
    expect(result.stdout).toContain('Checking prepositions in locale files');
  });

  test('should handle non-existent directory gracefully', () => {
    const result = runI18nNbsp(['--check', 'non-existent-dir']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Error:');
  });

  test('should handle empty directory', () => {
    const result = runI18nNbsp(['--check', 'non-existent-empty-dir']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Error:');
  });

  test('should work with locales flag', () => {
    const result = runI18nNbsp(['--locales', TEST_DIR, '--check']);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('Checking prepositions in locale files');
  });

  test('should handle Ukrainian prepositions', () => {
    const result = runI18nNbsp(['--config', CONFIG_FILE, '--check', TEST_DIR]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('common.json'); // Should process uk/common.json
  });

  test('should default to check mode when no flags specified', () => {
    const result = runI18nNbsp([TEST_DIR]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('Checking prepositions in locale files');
  });

  test('should verify non-breaking spaces are actually inserted', () => {
    // Fix the files
    const fixResult = runI18nNbsp(['--fix', TEST_DIR]);
    expect(fixResult.exitCode).toBe(0);

    // Read the fixed file and verify non-breaking spaces
    const fixedContent = fs.readFileSync(
      path.join(TEST_DIR, 'en', 'common.json'),
      'utf-8'
    );

    // Non-breaking space is \u00A0 which appears as bytes c2 a0 in UTF-8
    expect(fixedContent).toContain('\u00A0'); // Should contain non-breaking spaces
    expect(fixedContent).toContain('to\u00A0our'); // "to our" should become "to<nbsp>our"
  });

  test('should work with custom languages (klingon and elvish)', () => {
    // First check that issues exist in custom languages
    const checkResult = runI18nNbsp([
      '--config',
      CUSTOM_CONFIG_FILE,
      '--check',
      CUSTOM_TEST_DIR,
    ]);
    expect(checkResult.exitCode).toBe(1); // Should find issues
    expect(checkResult.stdout).toContain(
      'Checking prepositions in locale files'
    );
    expect(checkResult.stdout).toContain('common.json'); // Should process both klingon and elvish files

    // Fix the issues
    const fixResult = runI18nNbsp([
      '--config',
      CUSTOM_CONFIG_FILE,
      '--fix',
      CUSTOM_TEST_DIR,
    ]);
    expect(fixResult.exitCode).toBe(0);
    expect(fixResult.stdout).toContain('Fixing preposition issues');
    expect(fixResult.stdout).toContain('Successfully fixed');

    // Verify issues are fixed
    const verifyResult = runI18nNbsp([
      '--config',
      CUSTOM_CONFIG_FILE,
      '--check',
      CUSTOM_TEST_DIR,
    ]);
    expect(verifyResult.exitCode).toBe(0);
    expect(verifyResult.stdout).toContain('No preposition issues found');

    // Verify specific fixes in klingon
    const klingonContent = fs.readFileSync(
      path.join(CUSTOM_TEST_DIR, 'klingon', 'common.json'),
      'utf-8'
    );
    expect(klingonContent).toContain('pagh\u00A0warriors'); // "pagh warriors" should become "pagh<nbsp>warriors"
    expect(klingonContent).toContain('vagh\u00A0enemies'); // "vagh enemies" should become "vagh<nbsp>enemies"

    // Verify specific fixes in elvish
    const elvishContent = fs.readFileSync(
      path.join(CUSTOM_TEST_DIR, 'elvish', 'common.json'),
      'utf-8'
    );
    expect(elvishContent).toContain('nan\u00A0friend'); // "nan friend" should become "nan<nbsp>friend"
    expect(elvishContent).toContain('vi\u00A0your'); // "vi your" should become "vi<nbsp>your"
  });
});
