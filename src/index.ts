import fs from 'fs';
import path from 'path';
import { parseCypressTestFile } from './parser';

/**
 * Recursively finds files matching the pattern in a directory
 * @param dir Directory to search in
 * @param pattern Regex pattern to match file names
 * @returns Array of matching file paths
 */
function findFilesRecursively(dir: string, pattern: RegExp): string[] {
  let results: string[] = [];
  
  // Read directory contents
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (item !== 'node_modules' && !item.startsWith('.')) {
        results = results.concat(findFilesRecursively(itemPath, pattern));
      }
    } 
    else if (stat.isFile() && pattern.test(item)) {
      // Add matching files to results
      results.push(itemPath);
    }
  }
  
  return results;
}

// Find all Cypress test files (.cy.js/ts and .spec.js/ts)
const filePattern = /\.(cy|spec)\.(js|ts)$/;
const testFiles = findFilesRecursively('.', filePattern);

// Initialize markdown document
let markdown = `# Cypress Test Documentation\n\n`;

// Group files by type for statistics
const groupedFiles = {
  cypress: testFiles.filter(file => file.includes('.cy.')),
  spec: testFiles.filter(file => file.includes('.spec.'))
};

// Add summary section with statistics
markdown += `## Summary\n\n`;
markdown += `- Total Test Files: **${testFiles.length}**\n`;
markdown += `- Cypress Files (.cy): **${groupedFiles.cypress.length}**\n`;
markdown += `- Spec Files (.spec): **${groupedFiles.spec.length}**\n\n`;
markdown += `---\n\n`;

// Process each test file
testFiles.forEach(filePath => {
  const result = parseCypressTestFile(filePath);

  // Add file information
  markdown += `## File: **${result.fileName}**\n\n`;
  markdown += `**Path:** ${result.filePath}\n\n`;
  
  // Include metadata if available
  if (result.description) {
    markdown += `**Description:** ${result.description}\n\n`;
  }
  
  if (result.author) {
    markdown += `**Author:** ${result.author}\n\n`;
  }
  
  // Include describe block if present
  if (result.describe !== 'N/A') {
    markdown += `## Describe: **${result.describe}**\n\n`;
  }
  
  // Include context block if present
  if (result.context) {
    markdown += `### Context: **${result.context}**\n\n`;
  }
  
  // List test cases
  markdown += `#### Tests\n`;
  result.its.forEach(it => {
    markdown += `- ${it}\n`;
  });

  markdown += `\n---\n\n`;
});

// Write documentation to file
fs.writeFileSync('spec-docs.md', markdown);
console.log('✅ spec-docs.md generated successfully!');
console.log(`Found ${testFiles.length} test files (${groupedFiles.cypress.length} .cy files, ${groupedFiles.spec.length} .spec files).`);
