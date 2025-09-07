# i18n-nbsp

Automatically adds non-breaking spaces after prepositions in i18n JSON files.

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

Default prepositions work for English, Russian and Ukrainian. To customize, create `i18n-nbsp.config.json`:

```json
{
  "localesPath": "./public/locales",
  "prepositions": {
    "en": ["to", "from", "in", "at", "on"],
    "ru": ["в", "из", "на", "с", "к"],
    "uk": ["в", "на", "від", "до", "з"]
  }
}
```

## Options

- `--check` - check files (default)
- `--fix` - fix files
- `--locales <path>` - path to locales directory
- `--config <path>` - path to config file
- `--help` - show help
