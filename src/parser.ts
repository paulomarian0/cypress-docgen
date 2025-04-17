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
  const fileType = fileName.includes('.cy') ? 'cypress' : 'spec';

  // Extract test structure with regular expressions
  const describeMatch = content.match(/describe\s*\(\s*['"`](.*?)['"`]/);
  const contextMatch = content.match(/context\s*\(\s*['"`](.*?)['"`]/);
  
  // Extract test titles while filtering out unwanted content
  const itTitles = [];
  const testBlocks = content.split(/it\s*\(\s*['"]/);
  
  // Skip the first element (preamble)
  for (let i = 1; i < testBlocks.length; i++) {
    // Extract the title until the next string delimiter
    const titleMatch = testBlocks[i].match(/^(.*?)['"`]/);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      
      // Filter out URLs and Cypress commands
      if (!title.startsWith('/') && !title.startsWith('cy.') && title.length > 0) {
        itTitles.push(title);
      }
    }
  }
  
  // Extract JSDoc metadata
  const descriptionMatch = content.match(/@description\s+(.*?)($|\n|\*)/);
  const authorMatch = content.match(/@author\s+(.*?)($|\n|\*)/);

  // Set default values if patterns aren't found
  const describe = describeMatch?.[1] ?? 'N/A';
  const context = contextMatch?.[1] ?? ''; // Only set if explicitly present
  const description = descriptionMatch?.[1]?.trim() ?? '';
  const author = authorMatch?.[1]?.trim() ?? '';

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
