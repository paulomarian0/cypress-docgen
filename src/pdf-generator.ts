import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { parseCypressTestFile } from './parser';
import { IParsedTestFile } from './types';

function findFilesRecursively(dir: string, pattern: RegExp): string[] {
  let results: string[] = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      if (
        item !== 'node_modules' &&
        (!item.startsWith('.') || item === '.jsons')
      ) {
        results = results.concat(findFilesRecursively(itemPath, pattern));
      }
    }
    else if (stat.isFile()) {
      const relativePath = path.relative(process.cwd(), itemPath);

      if (pattern.test(relativePath)) {
        results.push(itemPath);
      }
    }
  }

  return results;
}

function generateTestDocumentationHTML(testFiles: string[], projectName: string): string {
  const parsedFiles: IParsedTestFile[] = testFiles.map(filePath => parseCypressTestFile(filePath));

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Documentation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
            background-color: #fff;
        }
        h1 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            font-size: 20px;
            margin-top: 35px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        h3 {
            color: #7f8c8d;
            font-size: 16px;
            margin-top: 25px;
            margin-bottom: 10px;
            font-style: italic;
        }
        ul {
            margin: 10px 0;
            padding-left: 25px;
        }
        li {
            margin: 8px 0;
            color: #555;
        }
        .context-section {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border-left: 3px solid #3498db;
        }
        .test-item {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .meta-info {
            font-style: italic;
            color: #7f8c8d;
            font-size: 14px;
            margin-bottom: 10px;
        }
        @media print {
            body { margin: 20px; }
            h1 { page-break-after: avoid; }
            h2 { page-break-after: avoid; }
            .context-section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <h1>Test Documentation</h1>
`;

  // Group files by their main describe block or directory structure
  const groupedFiles = new Map<string, IParsedTestFile[]>();

  parsedFiles.forEach(file => {
    let groupKey = file.describe;

    // If no describe block, use the directory path as group
    if (groupKey === 'N/A') {
      const dirPath = path.dirname(file.filePath);
      groupKey = dirPath === '.' ? 'Root Tests' : dirPath.replace(/\//g, ' - ');
    }

    if (!groupedFiles.has(groupKey)) {
      groupedFiles.set(groupKey, []);
    }
    groupedFiles.get(groupKey)!.push(file);
  });

  // Generate HTML for each group
  groupedFiles.forEach((files, groupName) => {
    html += `<h2>${groupName}</h2>\n`;

    files.forEach(file => {
      // Add metadata if available
      if (file.description || file.author) {
        html += '<div class="meta-info">';
        if (file.description) html += `Description: ${file.description}<br>`;
        if (file.author) html += `Author: ${file.author}`;
        html += '</div>';
      }

      html += '<h3>Tests</h3>\n<ul>\n';

      // Handle multiple contexts or fallback to direct tests
      if (file.contexts && file.contexts.length > 0) {
        file.contexts.forEach(context => {
          if (file.contexts!.length > 1) {
            html += `<li><strong>${context.name}</strong><ul>`;
            context.tests.forEach(test => {
              html += `<li class="test-item">${test}</li>`;
            });
            html += '</ul></li>';
          } else {
            // Single context, list tests directly
            context.tests.forEach(test => {
              html += `<li class="test-item">${test}</li>`;
            });
          }
        });
      } else if (file.its && file.its.length > 0) {
        // Fallback for files without contexts
        file.its.forEach(test => {
          html += `<li class="test-item">${test}</li>`;
        });
      }

      html += '</ul>\n';
    });
  });

  html += `
</body>
</html>`;

  return html;
}

export async function generateSinglePDF(workingDir: string = process.cwd()): Promise<void> {
  const originalCwd = process.cwd();

  try {
    // Change to the target directory
    process.chdir(workingDir);

    const filePattern = /\.(cy|spec|test)\.(js|ts)$/;
    const testFiles = findFilesRecursively('.', filePattern);

    if (testFiles.length === 0) {
      console.log('No test files found.');
      return;
    }

    const projectName = path.basename(workingDir);
    const htmlContent = generateTestDocumentationHTML(testFiles, projectName);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const outputPath = path.join(workingDir, 'spec-docs.pdf');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true
    });

    await browser.close();

    // Calculate statistics
    const parsedFiles: IParsedTestFile[] = testFiles.map(filePath => parseCypressTestFile(filePath));
    let totalIndividualTests = 0;
    parsedFiles.forEach((parsed: IParsedTestFile) => {
      if (parsed.contexts && parsed.contexts.length > 0) {
        parsed.contexts.forEach((context: any) => {
          totalIndividualTests += context.tests.length;
        });
      } else {
        totalIndividualTests += parsed.its.length;
      }
    });

    const groupedFiles = {
      cypress: testFiles.filter(file => file.includes('.cy.')),
      spec: testFiles.filter(file => file.includes('.spec.')),
      test: testFiles.filter(file => file.includes('.test.'))
    };

    console.log('✅ spec-docs.pdf generated successfully!');
    console.log(`📄 PDF document created with ${testFiles.length} test files and ${totalIndividualTests} individual tests (${groupedFiles.cypress.length} .cy files, ${groupedFiles.spec.length} .spec files, ${groupedFiles.test.length} .test files).`);
  } finally {
    // Restore original working directory
    process.chdir(originalCwd);
  }
}

export async function generateFolderPDFs(workingDir: string = process.cwd()): Promise<void> {
  const originalCwd = process.cwd();

  try {
    // Change to the target directory
    process.chdir(workingDir);

    const filePattern = /\.(cy|spec|test)\.(js|ts)$/;
    const testFiles = findFilesRecursively('.', filePattern);

    if (testFiles.length === 0) {
      console.log('No test files found.');
      return;
    }

    // Group files by directory
    const filesByDirectory = new Map<string, string[]>();

    testFiles.forEach(filePath => {
      const relativePath = path.relative(process.cwd(), filePath);
      const dirPath = path.dirname(relativePath);
      const normalizedDir = dirPath === '.' ? 'root' : dirPath;

      if (!filesByDirectory.has(normalizedDir)) {
        filesByDirectory.set(normalizedDir, []);
      }
      filesByDirectory.get(normalizedDir)!.push(filePath);
    });

    // Ensure output directory exists
    const outputDir = path.join(workingDir, 'spec-docs-pdf');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate PDF for each directory
    for (const [dirPath, files] of filesByDirectory) {
      const projectName = path.basename(workingDir);
      const dirDisplayName = dirPath === 'root' ? projectName : `${projectName} - ${dirPath.replace(/[\/\\]/g, ' - ')}`;

      const htmlContent = generateTestDocumentationHTML(files, dirDisplayName);

      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Create filename from directory path
      const fileName = dirPath === 'root' ? 'overview.pdf' : `${dirPath.replace(/[\/\\]/g, '-')}.pdf`;
      const outputPath = path.join(outputDir, fileName);

      await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      });

      await browser.close();

      // Calculate statistics for this directory
      const parsedFiles: IParsedTestFile[] = files.map(filePath => parseCypressTestFile(filePath));
      let totalIndividualTests = 0;
      parsedFiles.forEach((parsed: IParsedTestFile) => {
        if (parsed.contexts && parsed.contexts.length > 0) {
          parsed.contexts.forEach((context: any) => {
            totalIndividualTests += context.tests.length;
          });
        } else {
          totalIndividualTests += parsed.its.length;
        }
      });

      const groupedFiles = {
        cypress: files.filter(file => file.includes('.cy.')),
        spec: files.filter(file => file.includes('.spec.')),
        test: files.filter(file => file.includes('.test.'))
      };

      console.log(`✅ ${fileName} generated successfully! (${files.length} files, ${totalIndividualTests} tests)`);
    }

    console.log(`📄 PDF documentation generated for ${filesByDirectory.size} directories in '${outputDir}' folder.`);
  } finally {
    // Restore original working directory
    process.chdir(originalCwd);
  }
}