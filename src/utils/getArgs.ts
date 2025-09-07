import type { CLIOptions } from '../types.js';

export const getArgs = (): CLIOptions => {
  const args = process.argv.slice(2);

  const options: CLIOptions = {
    check: false,
    fix: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--check':
        options.check = true;
        break;
      case '--fix':
        options.fix = true;
        break;
      case '--config':
        if (i + 1 < args.length) {
          options.config = args[++i];
        }
        break;
      case '--locales':
        if (i + 1 < args.length) {
          options.localesPath = args[++i];
        }
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (arg && !arg.startsWith('-')) {
          // If no explicit locale path was provided via flag, treat first non-flag argument as locales path
          if (!options.localesPath) {
            options.localesPath = arg;
          }
        }
        break;
    }
  }

  // Default to check mode if neither check nor fix is specified
  if (!options.check && !options.fix && !options.help) {
    options.check = true;
  }

  return options;
};
