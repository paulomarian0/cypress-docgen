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

You can install cypress-docgen globally or as a dev dependency in your project:

### Global Installation

```bash
npm install -g cypress-docgen
```

### Local Installation (Recommended)

```bash
npm install --save-dev cypress-docgen
```

## Usage

### Global Installation

If installed globally, you can run the commands from anywhere:

```bash
# Generate a single documentation file
cypress-docgen

# Generate documentation files per directory
cypress-docgen-folder
```

### Local Installation

If installed locally, you can add scripts to your `package.json`:

```json
{
  "scripts": {
    "docs": "cypress-docgen",
    "docs:folder": "cypress-docgen-folder"
  }
}
```

Then run:

```bash
npm run docs
npm run docs:folder
```

Or use npx to run directly:

```bash
npx cypress-docgen
npx cypress-docgen-folder
```

### Programmatic Usage

You can also use cypress-docgen programmatically in your Node.js scripts:

```javascript
const { generateSingleDoc, generateFolderDocs } = require('cypress-docgen');

// Generate single documentation file
generateSingleDoc(); // Uses current directory
generateSingleDoc('/path/to/your/project'); // Specify custom directory

// Generate documentation files per directory
generateFolderDocs(); // Uses current directory
generateFolderDocs('/path/to/your/project'); // Specify custom directory
```

## Output

### Single Documentation File

When using `cypress-docgen`, the tool generates a `spec-docs.md` file with the following information:

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

When using `cypress-docgen-folder`, the tool creates separate Markdown files for each directory containing tests:

- Files are stored in a `spec-docs-folder` directory
- Each file is named after the directory path (with path separators replaced by hyphens)
- Each file contains only the tests from that specific directory
- The format of each file is similar to the single documentation file

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

## Development

If you want to contribute to this project:

```bash
# Clone the repository
git clone https://github.com/yourusername/cypress-docgen.git

# Navigate to the project directory
cd cypress-docgen

# Install dependencies
npm install

# Build the project
npm run build
```

## Requirements

- Node.js 14.0.0 or higher
- Cypress tests in your project (the tool will scan for `.cy`, `.spec`, and `.test` files)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

#### Contributors❤️

[![langflow contributors](https://contrib.rocks/image?repo=paulomarian0/cypress-docgen)](https://github.com/paulomarian0/cypress-docgen/graphs/contributors)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
