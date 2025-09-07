const removeColorsFromOutput = (output: string): string =>
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes are needed for terminal output cleaning
  output.replace(/\u001B\[[0-9;]*m/g, '');

export const runI18nNbsp = (
  args: string[] = []
): { stdout: string; stderr: string; exitCode: number } => {
  const fullArgs = ['src/index.ts', ...args];

  const result = Bun.spawnSync(['bun', ...fullArgs], {
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const stdout = removeColorsFromOutput(result.stdout.toString());
  const stderr = removeColorsFromOutput(result.stderr.toString());

  return {
    stdout,
    stderr,
    exitCode: result.exitCode,
  };
};
