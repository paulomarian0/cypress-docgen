import fs from 'fs';
import path from 'path';
import { parseCypressTestFile } from './parser';
import { IParsedTestFile } from './types';

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

function groupFilesByDirectory(files: string[]): Record<string, string[]> {
    const filesByDirectory: Record<string, string[]> = {};

    files.forEach(file => {
        const directory = path.dirname(file);
        if (!filesByDirectory[directory]) {
            filesByDirectory[directory] = [];
        }
        filesByDirectory[directory].push(file);
    });

    return filesByDirectory;
}

function generateMarkdownForDirectory(directoryPath: string, files: string[]): string {
    const directoryName = path.basename(directoryPath);

    const groupedFiles = {
        cypress: files.filter(file => file.includes('.cy.')),
        spec: files.filter(file => file.includes('.spec.')),
        test: files.filter(file => file.includes('.test.'))
    };

    let markdown = `# Cypress Test Documentation - ${directoryName}\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- Total Test Files: **${files.length}**\n`;
    markdown += `- Cypress Files (.cy): **${groupedFiles.cypress.length}**\n`;
    markdown += `- Spec Files (.spec): **${groupedFiles.spec.length}**\n`;
    markdown += `- Test Files (.test): **${groupedFiles.test.length}**\n\n`;
    markdown += `---\n\n`;

    const parsedFiles: IParsedTestFile[] = files.map(filePath => parseCypressTestFile(filePath));

    parsedFiles.forEach(result => {
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

        // Handle multiple contexts
        if (result.contexts && result.contexts.length > 0) {
            result.contexts.forEach(context => {
                markdown += `### Context: **${context.name}**\n\n`;
                markdown += `#### Tests\n`;
                context.tests.forEach(test => {
                    markdown += `- ${test}\n`;
                });
                markdown += `\n`;
            });
        } else if (result.its && result.its.length > 0) {
            // Fallback for files without contexts
            markdown += `#### Tests\n`;
            result.its.forEach(it => {
                markdown += `- ${it}\n`;
            });
            markdown += `\n`;
        }

        markdown += `---\n\n`;
    });

    return markdown;
}

function createDocFolder(workingDir: string): string {
    const docFolderPath = path.join(workingDir, 'spec-docs-folder');
    if (!fs.existsSync(docFolderPath)) {
        fs.mkdirSync(docFolderPath);
    }
    return docFolderPath;
}

export function generateFolderDocs(workingDir: string = process.cwd()): void {
    const originalCwd = process.cwd();
    
    try {
        // Change to the target directory
        process.chdir(workingDir);
        
        const filePattern = /\.(cy|spec|test)\.(js|ts)$/;
        const testFiles = findFilesRecursively('.', filePattern);

        const filesByDirectory = groupFilesByDirectory(testFiles);

        const docFolderPath = createDocFolder(workingDir);

        let totalDocumentsGenerated = 0;
        const directories = Object.keys(filesByDirectory);

        directories.forEach(directory => {
            const files = filesByDirectory[directory];
            const markdown = generateMarkdownForDirectory(directory, files);

            const safeDirectoryName = directory.replace(/[\\\/]/g, '-').replace(/^\./, '').replace(/^-/, '');
            const outputFilename = safeDirectoryName || 'root';

            const outputPath = path.join(docFolderPath, `${outputFilename}.md`);
            fs.writeFileSync(outputPath, markdown);
            totalDocumentsGenerated++;

            console.log(`Generated documentation for directory: ${directory}`);
        });

        console.log(`✅ Generated ${totalDocumentsGenerated} markdown files in the docs folder.`);
        console.log(`Found ${testFiles.length} test files across ${directories.length} directories.`);
    } finally {
        // Restore original working directory
        process.chdir(originalCwd);
    }
} 