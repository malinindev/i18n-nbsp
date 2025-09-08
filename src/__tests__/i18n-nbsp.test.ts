import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { runI18nNbsp } from './runI18nNbsp.js';

const TEST_DIR = 'src/__tests__/fixtures/locales';
const CONFIG_FILE = 'src/__tests__/fixtures/test-config.json';
const CUSTOM_TEST_DIR = 'src/__tests__/fixtures/custom-locales';
const CUSTOM_CONFIG_FILE = 'src/__tests__/fixtures/custom-lang-config.json';
const REGIONAL_TEST_DIR = 'src/__tests__/fixtures/regional-locales';
const REGIONAL_CONFIG_FILE = 'src/__tests__/fixtures/regional-config.json';

// Store original fixture contents to restore after tests
let originalFixtures: {
  en: string;
  ru: string;
  uk: string;
  klingon: string;
  elvish: string;
  enAuBlog: string;
  enAuLpFeatures: string;
  deChCatalog: string;
};

const backupOriginalFixtures = (): void => {
  const enFile = path.join(TEST_DIR, 'en', 'common.json');
  const ruFile = path.join(TEST_DIR, 'ru', 'common.json');
  const ukFile = path.join(TEST_DIR, 'uk', 'common.json');
  const klingonFile = path.join(CUSTOM_TEST_DIR, 'klingon', 'common.json');
  const elvishFile = path.join(CUSTOM_TEST_DIR, 'elvish', 'common.json');
  const enAuBlogFile = path.join(REGIONAL_TEST_DIR, 'en-AU', 'blog.json');
  const enAuLpFeaturesFile = path.join(
    REGIONAL_TEST_DIR,
    'en-AU',
    'lp',
    'features.json'
  );
  const deChCatalogFile = path.join(
    REGIONAL_TEST_DIR,
    'de-CH',
    'products',
    'catalog.json'
  );

  originalFixtures = {
    en: fs.readFileSync(enFile, 'utf-8'),
    ru: fs.readFileSync(ruFile, 'utf-8'),
    uk: fs.readFileSync(ukFile, 'utf-8'),
    klingon: fs.readFileSync(klingonFile, 'utf-8'),
    elvish: fs.readFileSync(elvishFile, 'utf-8'),
    enAuBlog: fs.readFileSync(enAuBlogFile, 'utf-8'),
    enAuLpFeatures: fs.readFileSync(enAuLpFeaturesFile, 'utf-8'),
    deChCatalog: fs.readFileSync(deChCatalogFile, 'utf-8'),
  };
};

const restoreOriginalFixtures = (): void => {
  const enFile = path.join(TEST_DIR, 'en', 'common.json');
  const ruFile = path.join(TEST_DIR, 'ru', 'common.json');
  const ukFile = path.join(TEST_DIR, 'uk', 'common.json');
  const klingonFile = path.join(CUSTOM_TEST_DIR, 'klingon', 'common.json');
  const elvishFile = path.join(CUSTOM_TEST_DIR, 'elvish', 'common.json');
  const enAuBlogFile = path.join(REGIONAL_TEST_DIR, 'en-AU', 'blog.json');
  const enAuLpFeaturesFile = path.join(
    REGIONAL_TEST_DIR,
    'en-AU',
    'lp',
    'features.json'
  );
  const deChCatalogFile = path.join(
    REGIONAL_TEST_DIR,
    'de-CH',
    'products',
    'catalog.json'
  );

  fs.writeFileSync(enFile, originalFixtures.en);
  fs.writeFileSync(ruFile, originalFixtures.ru);
  fs.writeFileSync(ukFile, originalFixtures.uk);
  fs.writeFileSync(klingonFile, originalFixtures.klingon);
  fs.writeFileSync(elvishFile, originalFixtures.elvish);
  fs.writeFileSync(enAuBlogFile, originalFixtures.enAuBlog);
  fs.writeFileSync(enAuLpFeaturesFile, originalFixtures.enAuLpFeatures);
  fs.writeFileSync(deChCatalogFile, originalFixtures.deChCatalog);
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

  test('should show helpful error when no JSON files found', () => {
    const emptyDir = 'src/__tests__/fixtures/empty-dir';

    // Ensure directory exists and is empty
    if (fs.existsSync(emptyDir)) {
      fs.rmSync(emptyDir, { recursive: true });
    }
    fs.mkdirSync(emptyDir, { recursive: true });

    const result = runI18nNbsp(['--check', emptyDir]);

    // Clean up
    fs.rmSync(emptyDir, { recursive: true });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No JSON files found');
    expect(result.stderr).toContain('Make sure the locales path is correct');
    expect(result.stderr).toContain('Use --locales flag to specify the path');
    expect(result.stderr).toContain('Set "localesPath" in your config file');
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

  test('should work with regional languages and nested folders', () => {
    // First check that issues exist in regional languages with nested structure
    const checkResult = runI18nNbsp([
      '--config',
      REGIONAL_CONFIG_FILE,
      '--check',
      REGIONAL_TEST_DIR,
    ]);
    expect(checkResult.exitCode).toBe(1); // Should find issues
    expect(checkResult.stdout).toContain(
      'Checking prepositions in locale files'
    );
    expect(checkResult.stdout).toContain('en-AU/blog.json'); // Should process en-AU files using 'en' patterns
    expect(checkResult.stdout).toContain('en-AU/lp/features.json'); // Should handle nested folders
    expect(checkResult.stdout).toContain('de-CH/products/catalog.json'); // Should process de-CH using 'de' patterns

    // Fix the issues
    const fixResult = runI18nNbsp([
      '--config',
      REGIONAL_CONFIG_FILE,
      '--fix',
      REGIONAL_TEST_DIR,
    ]);
    expect(fixResult.exitCode).toBe(0);
    expect(fixResult.stdout).toContain('Fixing preposition issues');
    expect(fixResult.stdout).toContain('Successfully fixed');

    // Verify issues are fixed
    const verifyResult = runI18nNbsp([
      '--config',
      REGIONAL_CONFIG_FILE,
      '--check',
      REGIONAL_TEST_DIR,
    ]);
    expect(verifyResult.exitCode).toBe(0);
    expect(verifyResult.stdout).toContain('No preposition issues found');

    // Verify specific fixes in en-AU files (should use 'en' patterns)
    const enAuBlogContent = fs.readFileSync(
      path.join(REGIONAL_TEST_DIR, 'en-AU', 'blog.json'),
      'utf-8'
    );
    expect(enAuBlogContent).toContain('to\u00A0our'); // "to our" should become "to<nbsp>our"

    const enAuFeaturesContent = fs.readFileSync(
      path.join(REGIONAL_TEST_DIR, 'en-AU', 'lp', 'features.json'),
      'utf-8'
    );
    expect(enAuFeaturesContent).toContain('to\u00A0our'); // "to our" should become "to<nbsp>our"

    // Verify specific fixes in de-CH files (should use 'de' patterns)
    const deChCatalogContent = fs.readFileSync(
      path.join(REGIONAL_TEST_DIR, 'de-CH', 'products', 'catalog.json'),
      'utf-8'
    );
    expect(deChCatalogContent).toContain('in\u00A0unserem'); // "in unserem" should become "in<nbsp>unserem"
  });

  test('should allow disabling languages with null values', async () => {
    // Create a config that disables Russian
    const disableConfig = {
      localesPath: './src/__tests__/fixtures/locales',
      patterns: {
        ru: null, // Disable Russian processing
      },
    };

    const disableConfigFile = path.join(
      process.cwd(),
      'src/__tests__/fixtures/disable-ru-config.json'
    );
    fs.writeFileSync(disableConfigFile, JSON.stringify(disableConfig, null, 2));

    try {
      // Run check with disabled Russian
      const checkResult = runI18nNbsp([
        '--check',
        '--config',
        disableConfigFile,
      ]);

      // Should exit with code 1 (errors found) but not include Russian files in output
      expect(checkResult.exitCode).toBe(1);

      // Check that Russian files are not mentioned in the output
      expect(checkResult.stdout).not.toContain('ru/common.json');

      // But English files should still be processed and show errors
      expect(checkResult.stdout).toContain('en/common.json');
    } finally {
      // Clean up
      if (fs.existsSync(disableConfigFile)) {
        fs.unlinkSync(disableConfigFile);
      }
    }
  });
});
