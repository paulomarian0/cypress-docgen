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

    // Parse files once and calculate total individual tests
    const parsedFiles: IParsedTestFile[] = files.map(filePath => parseCypressTestFile(filePath));
    
    let totalIndividualTests = 0;
    parsedFiles.forEach(parsed => {
        if (parsed.contexts && parsed.contexts.length > 0) {
            parsed.contexts.forEach(context => {
                totalIndividualTests += context.tests.length;
            });
        } else {
            totalIndividualTests += parsed.its.length;
        }
    });

    let markdown = `# Cypress Test Documentation - ${directoryName}\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- Total Test Files: **${files.length}**\n`;
    markdown += `- Total Individual Tests: **${totalIndividualTests}**\n`;
    
    // Show only file types with non-zero count
    if (groupedFiles.cypress.length > 0) {
        markdown += `- Cypress Files (.cy): **${groupedFiles.cypress.length}**\n`;
    }
    if (groupedFiles.spec.length > 0) {
        markdown += `- Spec Files (.spec): **${groupedFiles.spec.length}**\n`;
    }
    if (groupedFiles.test.length > 0) {
        markdown += `- Test Files (.test): **${groupedFiles.test.length}**\n`;
    }
    markdown += `\n`;
    markdown += `---\n\n`;

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

function generateOverviewFile(workingDir: string, filesByDirectory: Record<string, string[]>, totalDocumentsGenerated: number): void {
    const docFolderPath = path.join(workingDir, 'spec-docs-folder');
    const overviewPath = path.join(docFolderPath, 'overview.md');
    
    // Calculate overall statistics
    let totalFiles = 0;
    let totalIndividualTests = 0;
    let totalCypressFiles = 0;
    let totalSpecFiles = 0;
    let totalTestFiles = 0;
    
    const directoryStats: Array<{
        name: string;
        files: number;
        tests: number;
        cypress: number;
        spec: number;
        test: number;
    }> = [];

    Object.entries(filesByDirectory).forEach(([directory, files]) => {
        totalFiles += files.length;
        
        // Group files by type
        const groupedFiles = {
            cypress: files.filter(file => file.includes('.cy.')),
            spec: files.filter(file => file.includes('.spec.')),
            test: files.filter(file => file.includes('.test.'))
        };
        
        totalCypressFiles += groupedFiles.cypress.length;
        totalSpecFiles += groupedFiles.spec.length;
        totalTestFiles += groupedFiles.test.length;
        
        // Calculate tests for this directory
        const parsedFiles = files.map(filePath => parseCypressTestFile(filePath));
        let directoryTests = 0;
        parsedFiles.forEach(parsed => {
            if (parsed.contexts && parsed.contexts.length > 0) {
                parsed.contexts.forEach(context => {
                    directoryTests += context.tests.length;
                });
            } else {
                directoryTests += parsed.its.length;
            }
        });
        
        totalIndividualTests += directoryTests;
        
        directoryStats.push({
            name: path.basename(directory) || 'root',
            files: files.length,
            tests: directoryTests,
            cypress: groupedFiles.cypress.length,
            spec: groupedFiles.spec.length,
            test: groupedFiles.test.length
        });
    });

    // Generate overview markdown
    let markdown = `# 📋 Test Documentation Overview\n\n`;
    
    const date = new Date();
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    
    markdown += `Generated on: ${formattedDate} ${formattedTime}\n\n`;
    
    markdown += `## 📊 Overall Statistics\n\n`;
    markdown += `- **Total Directories**: ${Object.keys(filesByDirectory).length}\n`;
    markdown += `- **Total Test Files**: ${totalFiles}\n`;
    markdown += `- **Total Individual Tests**: ${totalIndividualTests}\n`;
    
    // Show only file types with non-zero count
    if (totalCypressFiles > 0) {
        markdown += `- **Cypress Files (.cy)**: ${totalCypressFiles}\n`;
    }
    if (totalSpecFiles > 0) {
        markdown += `- **Spec Files (.spec)**: ${totalSpecFiles}\n`;
    }
    if (totalTestFiles > 0) {
        markdown += `- **Test Files (.test)**: ${totalTestFiles}\n`;
    }
    markdown += `\n---\n\n`;

    markdown += `## 📁 Directory Breakdown\n\n`;
    markdown += `| Directory | Files | Tests | `.trim();
    
    // Dynamic headers based on file types present
    if (totalCypressFiles > 0) markdown += `Cypress | `;
    if (totalSpecFiles > 0) markdown += `Spec | `;
    if (totalTestFiles > 0) markdown += `Test | `;
    markdown += `\n`;
    
    markdown += `|-----------|-------|-------|`.trim();
    if (totalCypressFiles > 0) markdown += `---------|`;
    if (totalSpecFiles > 0) markdown += `------|`;
    if (totalTestFiles > 0) markdown += `------|`;
    markdown += `\n`;

    directoryStats.forEach(stat => {
        markdown += `| ${stat.name} | ${stat.files} | ${stat.tests} | `.trim();
        if (totalCypressFiles > 0) markdown += `${stat.cypress} | `;
        if (totalSpecFiles > 0) markdown += `${stat.spec} | `;
        if (totalTestFiles > 0) markdown += `${stat.test} | `;
        markdown += `\n`;
    });

    markdown += `\n---\n\n`;
    markdown += `## 📄 Generated Documentation Files\n\n`;
    markdown += `The following files were generated in this directory:\n\n`;
    
    Object.keys(filesByDirectory).forEach(directory => {
        const safeDirectoryName = directory.replace(/[\\\/]/g, '-').replace(/^\./, '').replace(/^-/, '');
        const filename = safeDirectoryName || 'root';
        markdown += `- [${path.basename(directory) || 'root'}](${filename}.md)\n`;
    });
    
    markdown += `\n---\n\n`;
    markdown += `*This overview was automatically generated by Cypress-DocGen*\n`;

    fs.writeFileSync(overviewPath, markdown);
    console.log('✅ Overview file generated: spec-docs-folder/overview.md');
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

        // Generate overview file
        generateOverviewFile(workingDir, filesByDirectory, totalDocumentsGenerated);

        console.log(`✅ Generated ${totalDocumentsGenerated} markdown files in the docs folder.`);
        console.log(`Found ${testFiles.length} test files across ${directories.length} directories.`);
    } finally {
        // Restore original working directory
        process.chdir(originalCwd);
    }
} 