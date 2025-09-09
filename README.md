# i18n-nbsp

Automatically adds non-breaking spaces after prepositions, conjunctions, and other short words in i18n JSON files.

## Usage

Check files:
```bash
i18n-nbsp --check ./locales
```

Fix files:
```bash
i18n-nbsp --fix ./locales
```

Custom config:
```bash
i18n-nbsp --config ./my-config.json --fix ./locales
```

## Configuration

**Default settings:**
- **Locales path**: `./public/locales` (common for most projects)
- **Supported languages**: German, French, Italian, Spanish, Dutch, Polish, Russian, Ukrainian
- **Full list of patterns**: See [i18n-nbsp.config.json](./i18n-nbsp.config.json)

> **Note:** English is intentionally not included by default as non-breaking spaces are not commonly used in English typography. If you need English support, add it to your config: `"en": ["a", "an", "the", "to", "of", "in", "at", "on", "for"]`

To customize, create `i18n-nbsp.config.json`:

```json
{
  "localesPath": "./public/locales",
  "patterns": {
    "es": ["el", "la", "de", "a", "en"],
    "ru": ["в", "на", "с", "и", "или"]
  }
}
```

### Custom Languages

You can add support for any custom language by adding it to the configuration:

```json
{
  "localesPath": "./public/locales",
  "patterns": {
    "es": ["el", "la", "de"],
    "your-custom-lang": ["word1", "word2"]
  }
}
```

### Disabling Languages

To disable processing for specific languages, set them to `null`:

```json
{
  "patterns": {
    "de": null
  }
}
```

This will completely skip processing for German files, even if they are present in your locales directory.

**Note:** If you're adding patterns for a commonly used language, please consider contributing them back to the project by opening a Pull Request. Your contribution will help other developers!

## Options

- `--check` - check files (default)
- `--fix` - fix files
- `--locales <path>` - path to locales directory
- `--config <path>` - path to config file
- `--help` - show help
