import fs from 'fs';
import path from 'path';
import { IParsedTestFile, ITestContext } from './types';

interface TestPosition {
  title: string;
  position: number;
}

interface ContextPosition {
  name: string;
  position: number;
}

export function parseCypressTestFile(filePath: string): IParsedTestFile {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  // Find describe block
  const describeMatch = content.match(/describe\s*\(\s*['"`](.*?)['"`]/);
  const describe = describeMatch?.[1] ?? 'N/A';

  // Find all context blocks with their positions
  const contexts: ContextPosition[] = [];
  const contextRegex = /context\s*\(\s*['"`](.*?)['"`]/g;
  let contextMatch;
  
  while ((contextMatch = contextRegex.exec(content)) !== null) {
    contexts.push({
      name: contextMatch[1],
      position: contextMatch.index
    });
  }

  // Find all test blocks with their positions
  const tests: TestPosition[] = [];
  const itRegex = /it\s*\(\s*['"`](.*?)['"`]/g;
  let itMatch;

  console.log(`File: ${fileName} - Scanning for tests and contexts`);

  while ((itMatch = itRegex.exec(content)) !== null) {
    const title = itMatch[1].trim();
    
    // Filter out invalid titles
    if (!title.startsWith('/') &&
        !title.startsWith('cy.') &&
        !title.startsWith('@') &&
        title.length > 1) {
      tests.push({
        title,
        position: itMatch.index
      });
      console.log(`Found test: "${title}" at position ${itMatch.index}`);
    } else {
      console.log(`Skipped test due to filtering rules: "${title}"`);
    }
  }

  // Associate each test with its context
  const contextGroups: ITestContext[] = [];
  
  if (contexts.length === 0) {
    // No contexts found, group all tests under a default context
    if (tests.length > 0) {
      contextGroups.push({
        name: describe !== 'N/A' ? describe : 'Tests',
        tests: tests.map(t => t.title)
      });
    }
  } else {
    // Group tests by their contexts
    contexts.forEach((context, index) => {
      const contextStart = context.position;
      const contextEnd = index < contexts.length - 1 ? contexts[index + 1].position : content.length;
      
      const testsInContext = tests.filter(test => 
        test.position > contextStart && test.position < contextEnd
      );

      if (testsInContext.length > 0) {
        contextGroups.push({
          name: context.name,
          tests: testsInContext.map(t => t.title)
        });
        console.log(`Context "${context.name}" contains ${testsInContext.length} tests`);
      }
    });
  }

  // Extract JSDoc metadata
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
  console.log(`Total contexts found: ${contextGroups.length}`);
  console.log(`Total tests found: ${tests.length}`);

  // For backward compatibility
  const firstContext = contexts.length > 0 ? contexts[0].name : '';
  const allTests = tests.map(t => t.title);

  return {
    fileName,
    filePath: relativePath,
    describe,
    context: firstContext,
    contexts: contextGroups,
    its: allTests,
    description,
    author
  };
}
