# Cypress-DocGen

A tool designed to automatically generate documentation from Cypress tests.

## Overview

Cypress-DocGen extracts documentation from your Cypress test files and generates structured documentation. This helps maintain up-to-date documentation that's always in sync with your actual tests.

## Features

- Parses Cypress test files to extract documentation
- Supports both `.cy`, `.spec` and `.test` file formats
- Extracts test metadata from JSDoc-style comments
- Generates structured documentation in markdown format
- Groups test files by type for better organization
- Maintains documentation that's always in sync with your codebase
- Supports generating documentation files per directory

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cypress-docgen.git

# Navigate to the project directory
cd cypress-docgen

# Install dependencies
npm install
```

## Usage

### Generate a single documentation file

1. Build the project:

```bash
npm run build
```

2. Run the documentation generator:

```bash
npm run start
```

3. Or use the combined command:

```bash
npm run generate:doc
```

This will generate a single `spec-docs.md` file containing all test documentation.

### Generate documentation files per directory

To generate separate documentation files for each directory containing tests:

```bash
npm run generate:doc:folder
```

This will create a `spec-docs-folder` directory with separate Markdown files for each folder containing tests in your project.

## Metadata Support

You can add metadata to your tests using JSDoc-style comments:

```javascript
/**
 * @description This is a description of the test suite
 * @author Your Name
 */
context("Test Suite", () => {
  // Your tests here
});
```

The tool will extract these metadata fields and include them in the generated documentation.

## Output

### Single Documentation File

When using `npm run generate:doc`, the tool generates a `spec-docs.md` file with the following information:

#### Summary Section

- Total number of test files
- Count of Cypress (.cy) files
- Count of Spec (.spec) files
- Count of Test (.test) files

#### For Each Test File

- File name and path relative to the project root
- Description and author (if provided in JSDoc comments)
- Describe blocks (when present)
- Context blocks (when present)
- All test cases (it blocks)

### Directory-Based Documentation

When using `npm run generate:doc:folder`, the tool creates separate Markdown files for each directory containing tests:

- Files are stored in a `spec-docs-folder` directory
- Each file is named after the directory path (with path separators replaced by hyphens)
- Each file contains only the tests from that specific directory
- The format of each file is similar to the single documentation file

## Configuration

The tool can be configured by modifying the configuration files in the project. More details will be added as the project evolves.

## Requirements

- Node.js (latest LTS version recommended)
- TypeScript
- Cypress (in the project you want to document)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

#### Contributors❤️

[![langflow contributors](https://contrib.rocks/image?repo=paulomarian0/cypress-docgen)](https://github.com/paulomarian0/cypress-docgen/graphs/contributors)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
