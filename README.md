# Cypress-DocGen

A tool designed to automatically generate documentation from Cypress tests.

## Overview

Cypress-DocGen extracts documentation from your Cypress test files and generates structured documentation. This helps maintain up-to-date documentation that's always in sync with your actual tests.

## Features

- Parses Cypress test files to extract documentation
- Generates structured documentation in markdown format
- Supports custom documentation formats
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

When running any of these commands, the tool will automatically scan and process all `.cy.js`, `.cy.ts`, `.spec.js`, and `.spec.ts` files located in the `/tests` directory to generate the documentation.

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
