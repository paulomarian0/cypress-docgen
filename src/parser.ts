import fs from 'fs';
import path from 'path';
import { IParsedTestFile } from './types';

export function parseCypressTestFile(filePath: string): IParsedTestFile {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  const describeMatch = content.match(/describe\(['"`](.*?)['"`],/);
  const contextMatch = content.match(/context\(['"`](.*?)['"`],/g);
  const itMatches = content.match(/it\(['"`](.*?)['"`],/g);
  const visitMatch = content.match(/cy\.visit\((.*?)\)/);

  const describe = describeMatch?.[1] ?? 'N/A';
  const context = contextMatch?.[0]?.match(/['"`](.*?)['"`]/)?.[1] ?? 'N/A';
  const url = visitMatch?.[1]?.trim() ?? 'N/A';

  const its: string[] = itMatches?.map((it) => {
    const match = it.match(/it\(['"`](.*?)['"`]/);
    return match ? match[1] : null;
  }).filter(Boolean) as string[] || [];

  return {
    fileName,
    describe,
    url,
    context,
    its,
  };
}
