import fs from 'fs';
import path from 'path';
import { parseCypressTestFile } from './parser';

function findFilesRecursively(dir: string, pattern: RegExp): string[] {
  let results: string[] = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      if (item !== 'node_modules' && !item.startsWith('.')) {
        results = results.concat(findFilesRecursively(itemPath, pattern));
      }
    }
    else if (stat.isFile() && pattern.test(item)) {
      results.push(itemPath);
    }
  }

  return results;
}

export function generateSingleDoc(workingDir: string = process.cwd()): void {
  const originalCwd = process.cwd();
  
  try {
    // Change to the target directory
    process.chdir(workingDir);
    
    const filePattern = /\.(cy|spec|test)\.(js|ts)$/;
    const testFiles = findFilesRecursively('.', filePattern);

    let markdown = `# Cypress Test Documentation\n\n`;

    const groupedFiles = {
      cypress: testFiles.filter(file => file.includes('.cy.')),
      spec: testFiles.filter(file => file.includes('.spec.')),
      test: testFiles.filter(file => file.includes('.test.'))
    };

    markdown += `## Summary\n\n`;
    markdown += `- Total Test Files: **${testFiles.length}**\n`;
    markdown += `- Cypress Files (.cy): **${groupedFiles.cypress.length}**\n`;
    markdown += `- Spec Files (.spec): **${groupedFiles.spec.length}**\n`;
    markdown += `- Test Files (.test): **${groupedFiles.test.length}**\n\n`;
    markdown += `---\n\n`;

    testFiles.forEach(filePath => {
      const result = parseCypressTestFile(filePath);

      markdown += `## File: **${result.fileName}**\n\n`;
      markdown += `**Path:** ${result.filePath}\n\n`;

      if (result.description) {
        markdown += `**Description:** ${result.description}\n`;
      }

      if (result.author) {
        markdown += `**Author:** ${result.author}\n\n`;
      }

      if (result.describe !== 'N/A') {
        markdown += `## Describe: **${result.describe}**\n\n`;
      }

      if (result.context) {
        markdown += `### Context: **${result.context}**\n\n`;
      }

      markdown += `#### Tests\n`;
      result.its.forEach(it => {
        markdown += `- ${it}\n`;
      });

      markdown += `\n---\n\n`;
    });

    const outputPath = path.join(workingDir, 'spec-docs.md');
    fs.writeFileSync(outputPath, markdown);
    console.log('✅ spec-docs.md generated successfully!');
    console.log(`Found ${testFiles.length} test files (${groupedFiles.cypress.length} .cy files, ${groupedFiles.spec.length} .spec files, ${groupedFiles.test.length} .test files).`);
  } finally {
    // Restore original working directory
    process.chdir(originalCwd);
  }
}

// Export other utilities that might be useful
export { parseCypressTestFile } from './parser';
export * from './types';
