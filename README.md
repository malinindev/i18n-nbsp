# i18n-nbsp

Automatically adds non-breaking spaces after prepositions, conjunctions, articles, and negations in i18n JSON files.

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
- **Supported languages**: English, Russian, Ukrainian, German, French, Italian, Spanish, Dutch, Polish
- **Full list of patterns**: See [i18n-nbsp.config.json](./i18n-nbsp.config.json)

To customize, create `i18n-nbsp.config.json`:

```json
{
  "localesPath": "./public/locales",
  "patterns": {
    "en": ["at", "in", "to", "and", "or"],
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
    "en": ["at", "in", "and"],
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

This will completely skip processing for Russian and German files, even if they are present in your locales directory.

**Note:** If you're adding patterns for a commonly used language, please consider contributing them back to the project by opening a Pull Request. Your contribution will help other developers!

## Options

- `--check` - check files (default)
- `--fix` - fix files
- `--locales <path>` - path to locales directory
- `--config <path>` - path to config file
- `--help` - show help
