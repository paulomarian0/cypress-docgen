import fs from 'fs';
import path from 'path';
import { IParsedTestFile } from './types';

/**
 * Parses a Cypress test file to extract metadata and test information
 * @param filePath Path to the test file
 * @returns Structured test data
 */
export function parseCypressTestFile(filePath: string): IParsedTestFile {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  const fileExtension = path.extname(filePath);

  // Determine file type based on file name
  let fileType = 'other';
  if (fileName.includes('.cy.')) fileType = 'cypress';
  else if (fileName.includes('.spec.')) fileType = 'spec';
  else if (fileName.includes('.test.')) fileType = 'test';

  // Extract test structure with regular expressions
  const describeMatch = content.match(/describe\s*\(\s*['"`](.*?)['"`]/);
  const contextMatch = content.match(/context\s*\(\s*['"`](.*?)['"`]/);

  // Extract test titles while filtering out unwanted content
  const itTitles = [];
  const requestInterceptCalls = new Set<string>();
  const testBlocks = content.split(/it\s*\(\s*['"]/);

  console.log(`File: ${fileName} - Found ${testBlocks.length - 1} potential test blocks`);

  // Skip the first element (preamble)
  for (let i = 1; i < testBlocks.length; i++) {
    // Extract the title until the next string delimiter
    const titleMatch = testBlocks[i].match(/^(.*?)['"`]/);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      console.log(`Test block ${i}: Title extracted: "${title}"`);

      // Filter out URLs, Cypress commands, intercept/request aliases (starting with @), and single-letter titles
      if (!title.startsWith('/') &&
        !title.startsWith('cy.') &&
        !title.startsWith('@') &&
        title.length > 1) { // Require at least 2 characters
        itTitles.push(title);
        console.log(`Added test: "${title}"`);
      } else if (title.startsWith('@')) {
        // Save intercept/request calls separately
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

  // Extract JSDoc comments
  let description = '';
  let author = '';

  // Find JSDoc comment blocks
  const jsDocPattern = /\/\*\*([\s\S]*?)\*\//g;
  let jsDocMatch;

  while ((jsDocMatch = jsDocPattern.exec(content)) !== null) {
    const jsDocContent = jsDocMatch[1];

    // Extract description
    const descPattern = /@description\s+(.*?)(?=\s*\*\s*@|\s*\*\/|$)/s;
    const descMatch = jsDocContent.match(descPattern);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].replace(/\s*\*\s*/g, ' ').trim();
    }

    // Extract author
    const authorPattern = /@author\s+(.*?)(?=\s*\*\s*@|\s*\*\/|$)/s;
    const authorMatch = jsDocContent.match(authorPattern);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].replace(/\s*\*\s*/g, ' ').trim();
    }
  }

  // Log for debugging
  console.log(`File: ${fileName}`);
  console.log(`Description: "${description}"`);
  console.log(`Author: "${author}"`);
  console.log(`Tests found: ${itTitles.length}`);
  console.log(`Tests: ${JSON.stringify(itTitles)}`);

  // Set default values if patterns aren't found
  const describe = describeMatch?.[1] ?? 'N/A';
  const context = contextMatch?.[1] ?? ''; // Only set if explicitly present

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
