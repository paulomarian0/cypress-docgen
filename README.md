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

When running any of these commands, the tool will recursively scan your entire project directory and process all `.cy.js`, `.cy.ts`, `.spec.js`, `.spec.ts`, `.test.js`, and `.test.ts` files to generate the documentation.

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

The tool generates a `spec-docs.md` file with the following information:

### Summary Section

- Total number of test files
- Count of Cypress (.cy) files
- Count of Spec (.spec) files
- Count of Test (.test) files

### For Each Test File

- File name and path relative to the project root
- Description and author (if provided in JSDoc comments)
- Describe blocks (when present)
- Context blocks (when present)
- All test cases (it blocks)

## Configuration

The tool can be configured by modifying the configuration files in the project. More details will be added as the project evolves.

## Requirements

- Node.js (latest LTS version recommended)
- TypeScript
- Cypress (in the project you want to document)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
