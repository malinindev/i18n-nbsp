import fs from 'node:fs';
import path from 'node:path';

export const findJsonFiles = (
  dir: string,
  filesList: string[] = []
): string[] => {
  if (!fs.existsSync(dir)) {
    return filesList;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsonFiles(filePath, filesList);
    } else if (file.endsWith('.json')) {
      filesList.push(filePath);
    }
  }

  return filesList;
};

export const readFileContent = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf-8');
};

export const writeFileContent = (filePath: string, content: string): void => {
  fs.writeFileSync(filePath, content, 'utf-8');
};

export const validateJsonFile = (filePath: string): boolean => {
  try {
    const content = readFileContent(filePath);
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
};
