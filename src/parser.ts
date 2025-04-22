import fs from 'fs';
import path from 'path';
import { IParsedTestFile } from './types';

export function parseCypressTestFile(filePath: string): IParsedTestFile {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  const fileExtension = path.extname(filePath);

  let fileType = 'other';
  if (fileName.includes('.cy.')) fileType = 'cypress';
  else if (fileName.includes('.spec.')) fileType = 'spec';
  else if (fileName.includes('.test.')) fileType = 'test';

  const describeMatch = content.match(/describe\s*\(\s*['"`](.*?)['"`]/);
  const contextMatch = content.match(/context\s*\(\s*['"`](.*?)['"`]/);

  const itTitles = [];
  const requestInterceptCalls = new Set<string>();
  const testBlocks = content.split(/it\s*\(\s*['"]/);

  console.log(`File: ${fileName} - Found ${testBlocks.length - 1} potential test blocks`);

  for (let i = 1; i < testBlocks.length; i++) {
    const titleMatch = testBlocks[i].match(/^(.*?)['"`]/);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      console.log(`Test block ${i}: Title extracted: "${title}"`);

      if (!title.startsWith('/') &&
        !title.startsWith('cy.') &&
        !title.startsWith('@') &&
        title.length > 1) {
        itTitles.push(title);
        console.log(`Added test: "${title}"`);
      } else if (title.startsWith('@')) {
        requestInterceptCalls.add(title);
        console.log(`Skipped intercept/request: "${title}"`);
      } else if (title.length <= 1) {
        console.log(`Skipped single-letter title: "${title}"`);
      } else {
        console.log(`Skipped title due to filtering rules: "${title}"`);
      }
    } else {
      console.log(`Test block ${i}: No title match found`);
    }
  }

  let description = '';
  let author = '';

  const jsDocPattern = /\/\*\*([\s\S]*?)\*\//g;
  let jsDocMatch;

  while ((jsDocMatch = jsDocPattern.exec(content)) !== null) {
    const jsDocContent = jsDocMatch[1];

    const descPattern = /@description\s+(.*?)(?=\s*\*\s*@|\s*\*\/|$)/s;
    const descMatch = jsDocContent.match(descPattern);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].replace(/\s*\*\s*/g, ' ').trim();
    }

    const authorPattern = /@author\s+(.*?)(?=\s*\*\s*@|\s*\*\/|$)/s;
    const authorMatch = jsDocContent.match(authorPattern);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].replace(/\s*\*\s*/g, ' ').trim();
    }
  }

  console.log(`File: ${fileName}`);
  console.log(`Description: "${description}"`);
  console.log(`Author: "${author}"`);
  console.log(`Tests found: ${itTitles.length}`);
  console.log(`Tests: ${JSON.stringify(itTitles)}`);

  const describe = describeMatch?.[1] ?? 'N/A';
  const context = contextMatch?.[1] ?? '';

  return {
    fileName,
    filePath: relativePath,
    describe,
    context,
    its: itTitles,
    description,
    author
  };
}
