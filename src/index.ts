import fs from 'fs';
import path from 'path';
import { parseCypressTestFile } from './parser';

/**
 * Função para buscar arquivos recursivamente em um diretório
 */
function findFilesRecursively(dir: string, pattern: RegExp): string[] {
  let results: string[] = [];
  
  // Ler conteúdo do diretório
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    // Se for um diretório, buscar recursivamente dentro dele
    if (stat.isDirectory()) {
      // Ignorar node_modules e diretórios com ponto no nome
      if (item !== 'node_modules' && !item.startsWith('.')) {
        results = results.concat(findFilesRecursively(itemPath, pattern));
      }
    } 
    // Se for um arquivo e corresponder ao padrão, adicionar à lista
    else if (stat.isFile() && pattern.test(item)) {
      results.push(itemPath);
    }
  }
  
  return results;
}

// Buscar todos os arquivos .cy.js, .cy.ts, .spec.js, .spec.ts no repositório
const filePattern = /\.(cy|spec)\.(js|ts)$/;
const testFiles = findFilesRecursively('.', filePattern);

let markdown = `# Cypress Test Documentation\n\n`;

testFiles.forEach(filePath => {
  const result = parseCypressTestFile(filePath);

  markdown += `## File: **${result.fileName}**\n\n`;
  markdown += `**Path:** ${result.filePath}\n\n`;
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
console.log(`Found ${testFiles.length} test files.`);
