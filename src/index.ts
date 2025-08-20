import fs from 'fs';
import path from 'path';
import { parseCypressTestFile, getJsonMochawesome } from './parser';
import { ISuite, ITest } from './types';

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
      console.log('Testing the path:', relativePath);

      if (pattern.test(relativePath)) {
        results.push(itemPath);
      }
    }
  }

  return results;
}

function findReportJsonsDirs(dir: string): string[] {
  let results: string[] = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      const relativePath = path.relative(process.cwd(), itemPath);

      if (/reports[\/\\]\.jsons$/.test(relativePath) || /reports$/.test(relativePath)) {
        results.push(itemPath);
      }
      if (
        item !== 'node_modules' &&
        (!item.startsWith('.') || item === '.jsons')
      ) {
        results = results.concat(findReportJsonsDirs(itemPath));
      }
    }
  }

  return results;
}


function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}
interface CategoryStats {
  tests: number;
  passes: number;
  failures: number;
  duration: number;
}

function categoryTest(): string {

  const reportDirs = findReportJsonsDirs('.');
  const categoryMap: Record<string, CategoryStats> = {};

  // let categoryTitle = 0;
  // let totalTests = 0;
  // let totalFailures = 0;
  // let totalDuration = 0;

  for (const reportsPath of reportDirs) {
    const allReports = getJsonMochawesome(reportsPath);

    allReports.forEach((report) => {
      report.results.forEach((result) => {
        collectSuiteStatus(result.suites, categoryMap)
      })
    });
  }


  let markdown = `| **Category** | **Tests** | **Passes** | **Failures** | **% Pass** | **% fail** | **Duration** |\n`;
  markdown += `|--------------|------------|------------|------------|--------------|-------------|-------------|\n`;

  for (const [category, stats] of Object.entries(categoryMap)) {
    const passPercent = ((stats.passes / stats.tests) * 100).toFixed(1);
    const failPercent = ((stats.failures / stats.tests) * 100).toFixed(1);

    markdown += `| ${category} | ${stats.tests} | ${stats.passes} | ${stats.failures} | ${passPercent}% | ${failPercent}% | ${formatDuration(stats.duration)} |\n`;

  }
  return markdown;
}

function collectSuiteStatus(suites: ISuite[], categoryMap: Record<string, CategoryStats>) {
  suites.forEach((suites) => {
    const category = suites.title;
    const testCount = suites.tests.length;
    const passesCount = suites.tests.filter(t => t.state === 'passed').length;
    const failuresCount = suites.tests.filter(t => t.state === 'failed').length;
    const duration = suites.duration;

    if (!categoryMap[category]) {
      categoryMap[category] = { tests: 0, passes: 0, failures: 0, duration: 0 };
    }

    categoryMap[category].tests += testCount;
    categoryMap[category].passes += passesCount;
    categoryMap[category].failures += failuresCount;
    categoryMap[category].duration += duration;

    if (suites.suites && suites.suites.length > 0) {
      collectSuiteStatus(suites.suites, categoryMap);
    }
  });
}

interface TestDetails {
  id: string;
  category: string;
  title: string;
  status: "passed" | "failed" | "pending";
  duration: number;
}
function detailedTestReport(): string {
  const reportDirs = findReportJsonsDirs('.');
  const testList: TestDetails[] = [];
  let testCounter = 1;

  const padId = (num: number) => `CT${num.toString().padStart(3, '0')}`;

  // Scroll through all reports
  for (const reportsPath of reportDirs) {
    const allReports = getJsonMochawesome(reportsPath);

    allReports.forEach(report => {
      report.results.forEach(result => {
        const traverseSuites = (suites: ISuite[]) => {
          suites.forEach(suite => {
            const category = suite.title || 'Sem Categoria';
            suite.tests.forEach(test => {
              testList.push({
                id: padId(testCounter++),
                category,
                title: test.title,
                status: test.state,
                duration: test.duration
              });
            });

            // Recursive for sub-suites
            if (suite.suites && suite.suites.length > 0) {
              traverseSuites(suite.suites);
            }
          });
        };

        traverseSuites(result.suites);
      });
    });
  }

  let markdown = `| ID | Category | Test | Status | % Pass | Duration |\n`;
  markdown += `|----|----------|-------|--------|-----------|---------|\n`;

  testList.forEach(test => {
    const passPercent = test.status === 'passed' ? '100%' : '0%';
    const durationFormatted = formatDuration(test.duration);

    markdown += `| ${test.id} | ${test.category} | ${test.title} | ${test.status === 'passed' ? 'Passes' : 'Failure'} | ${passPercent} | ${durationFormatted} |\n`;
  });

  return markdown;
}

interface ErrorDetail {
  id: string;
  testTitle: string;
  errors: string[];
}

function errorReportMarkdown(): string {
  const reportDirs = findReportJsonsDirs('.');
  const errorList: ErrorDetail[] = [];
  let testCounter = 1;

  for (const reportsPath of reportDirs) {
    const allReports = getJsonMochawesome(reportsPath);

    allReports.forEach((report) => {
      report.results.forEach((result) => {
        traverseSuites(result.suites, errorList);
      });
    });
  }

  function traverseSuites(suites: ISuite[], list: ErrorDetail[]) {
    suites.forEach((suite) => {
      suite.tests.forEach((test) => {
        if (test.state === 'failed') {
          const id = `CT${testCounter.toString().padStart(3, '0')}`;
          testCounter++;
          const errors = test.err && Object.values(test.err).length
            ? Object.values(test.err).map(e => String(e))
            : ['Erro não detalhado'];
          list.push({
            id,
            testTitle: test.title,
            errors,
          });
        }
      });

      // Recursion for sub-suites
      if (suite.suites && suite.suites.length > 0) {
        traverseSuites(suite.suites, list);
      }
    });
  }

  // Gerando Markdown
  let markdown = '## 5. Error Details\n\n';
  if (errorList.length === 0) {
    markdown += 'No errors found in testing.\n';
    return markdown;
  }

  errorList.forEach((item) => {
    markdown += `### TEST ${item.id}\n`;
    markdown += `**Test:** ${item.testTitle}\n\n`;
    markdown += `${item.errors.length} Errors found:\n\n`;
    item.errors.forEach((err) => {
      markdown += `- ${err}\n`;
    });
    markdown += '\n';
  });

  return markdown;
}

export function generateSingleDoc(workingDir: string = process.cwd()): void {
  const originalCwd = process.cwd();

  try {
    // Change to the target directory
    process.chdir(workingDir);

    const filePattern = /\.(cy|spec|test)\.(js|ts)$/;
    const testFiles = findFilesRecursively('.', filePattern);

    let markdown = `# 📄 Execution Report - Cypress Tests\n\n`;

    const groupedFiles = {
      cypress: testFiles.filter(file => file.includes('.cy.')),
      spec: testFiles.filter(file => file.includes('.spec.')),
      test: testFiles.filter(file => file.includes('.test.'))
    };

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
    const day = String(date.getDate()).padStart(2, '0');
    
    const formattedDate = `${year}/${month}/${day}`;
    
    const hour = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    const formattedTime = `${hour}:${minutes}:${seconds}`;
    
    const dateTime = `${formattedDate} ${formattedTime}`;

    markdown += `## 1. Project Identification\n\n\n\n`;
    markdown += `| **Information**        | **Value**               |\n`;
    markdown += `|------------------------|-------------------------|\n`;
    markdown += `| **System**             | ${path.basename(workingDir)} |\n`;
    markdown += `| **Version**            | -                       |\n`;
    markdown += `| **Execution Date**     | ${dateTime}             |\n`;
    markdown += `| **Responsible**        | -                       |\n\n`;
    // markdown += `---\n\n`;

    markdown += `## 2. Objective\n\n\n`;
    markdown += `This report presents a detailed analysis of the Cypress test results identified in the project, focusing on file coverage and scenario structure.\n\n\n`;

    const reportDirs = findReportJsonsDirs('.');

    let totalTests = 0;
    let totalPasses = 0;
    let totalFailures = 0;
    let totalDuration = 0;
    let firstStartDate: Date | null = null;

    for (const reportsPath of reportDirs) {
      const allReports = getJsonMochawesome(reportsPath);

      allReports.forEach((report) => {
        const stats = report.stats;

        totalTests += stats.tests;
        totalPasses += stats.passes;
        totalFailures += stats.failures;
        totalDuration += stats.duration;

        // To get the earliest start date
        const reportStart = new Date(stats.start);
        if (!firstStartDate || reportStart < firstStartDate) {
          firstStartDate = reportStart;
        }
      });
    }

    const successRate = totalTests > 0 ? ((totalPasses / totalTests) * 100).toFixed(2) : '0.00';
    const failureRate = totalTests > 0 ? ((totalFailures / totalTests) * 100).toFixed(2) : '0.00';

    const totalDurationFormatted = formatDuration(totalDuration);

    markdown += `## 3. General Metrics\n\n\n`;
    markdown += `Test summary\n\n\n`;

    markdown += `| **METRIC**                     | **VALUE**           |\n`;
    markdown += `|--------------------------------|---------------------|\n`;
    markdown += `| **Total Tests Executed**       | ${totalTests}       |\n`;
    markdown += `| **Total Passed Tests**         | ${totalPasses} (${successRate}%) |\n`;
    markdown += `| **Total Failed Tests**         | ${totalFailures} (${failureRate}%) |\n`;
    markdown += `| **Total Execution Time**       | ${totalDurationFormatted} |\n`;
    // markdown += `---\n\n`;

    markdown += `## 4. Breakdown by File\n\n\n\n`;
    markdown += `Summary of the analysis divided by categories - Analysis by Test:\n\n\n`;
    markdown += categoryTest();

    markdown += `\n\n\n\nConsolidated information separated by test\n\n\n`;
    markdown += detailedTestReport();

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

      // markdown += `---\n\n`;
    });

    markdown += errorReportMarkdown();

    markdown += `## 6. Conclusions and Recommendations\n`;
    markdown += `- Prioritize fixing critical functionalities that failed during test execution.\n`;
    markdown += `- Investigate and fix recurring errors in table generation or filters identified in multiple test cases.\n`;
    markdown += `- Perform performance analysis on functionalities that showed longer execution times or slowness.\n`;
    markdown += `- Strengthen automated test coverage in areas with a history of failures to reduce future regressions.\n`;
    markdown += `- Establish a routine for reviewing and monitoring test results to identify trends and prevent recurring issues.\n`;

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
