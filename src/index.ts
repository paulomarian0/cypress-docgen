import fs from 'fs';
import path from 'path';
import { parseCypressTestFile } from './parser';

const testsDir = './tests';

const files = fs.readdirSync(testsDir).filter(file => file.includes('.cy.'));

let markdown = `# Cypress Test Documentation\n\n`;

files.forEach(file => {
  const filePath = path.join(testsDir, file);
  const result = parseCypressTestFile(filePath);

  markdown += `## File: **${result.fileName}**\n\n`;
  markdown += `## Describe: **${result.describe}**\n\n`;
  markdown += `### Context: **${result.context}**\n\n`;
  markdown += `#### Tests\n`;

  result.its.forEach(it => {
    markdown += `- ${it}\n`;
  });

  markdown += `\n---\n\n`;
});

fs.writeFileSync('spec-docs.md', markdown);
console.log('✅ spec-docs.md generated successfully!');
