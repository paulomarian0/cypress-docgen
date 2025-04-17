import fs from 'fs';
import path from 'path';
import { IParsedTestFile } from './types';

export function parseCypressTestFile(filePath: string): IParsedTestFile {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  const fileExtension = path.extname(filePath);
  const fileType = fileName.includes('.cy') ? 'cypress' : 'spec';

  // Expressões regulares mais robustas para capturar padrões comuns em testes
  const describeMatch = content.match(/describe\s*\(\s*['"`](.*?)['"`]/);
  const contextMatch = content.match(/context\s*\(\s*['"`](.*?)['"`]/);
  
  // Melhor extração para os títulos dos testes 'it'
  // Capturar apenas títulos reais de teste, sem URLs
  const itTitles = [];
  const testBlocks = content.split(/it\s*\(\s*['"]/);
  
  // Primeiro elemento é o preâmbulo, então ignoramos
  for (let i = 1; i < testBlocks.length; i++) {
    // Extrair o título até o próximo delimitador de string
    const titleMatch = testBlocks[i].match(/^(.*?)['"`]/);
    if (titleMatch && titleMatch[1]) {
      // Verificar se não é uma URL ou comando de visita
      const title = titleMatch[1].trim();
      // Filtrar URLs e comandos do Cypress que não deveriam estar nos títulos
      if (!title.startsWith('/') && !title.startsWith('cy.') && title.length > 0) {
        itTitles.push(title);
      }
    }
  }
  
  // Extrair comentários de descrição se disponíveis
  const descriptionMatch = content.match(/@description\s+(.*?)($|\n|\*)/);
  const authorMatch = content.match(/@author\s+(.*?)($|\n|\*)/);

  const describe = describeMatch?.[1] ?? contextMatch?.[1] ?? 'N/A';
  const context = contextMatch?.[1] ?? describeMatch?.[1] ?? 'N/A';
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
