<!--
Copyright 2025 wywy LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
you may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# @wywyjp/wyside Project Context

## Project Overview

`@wywyjp/wyside` is a framework for Google Apps Script development, designed to provide a modern local coding environment. It acts as a CLI tool to scaffold new projects with a robust setup including TypeScript, linting, formatting, and testing.

This project is a community-maintained fork of `@google/aside`, maintained by `wywyjp inc.` (wywy LLC).

### Key Technologies

- **Runtime**: Node.js
- **Language**: TypeScript
- **Build System**: Rollup
- **Testing**: Jest
- **GAS Interaction**: `@google/clasp`
- **Linting/Formatting**: ESLint, Prettier, GTS

## Architecture

- **CLI Entry Point**: `src/index.ts` (uses `meow` for CLI parsing).
- **Core Logic**: `src/app.ts` orchestrates the initialization process (`init` command).
- **Configuration**: `src/config.ts` defines the default `package.json` scripts and dependencies that are injected into new projects.
- **Package Management**: `src/package-helper.ts` handles `package.json` generation and modification.
- **Templates**:
  - `template/`: Standard GAS project template.
  - `template-ui/`: Angular-based UI project template.

## Building and Running

### Prerequisites

- Node.js (Version >= 22 as per `package.json` engines, though `src/package-helper.ts` generates projects with `>=12`).
- npm

### Key Commands

| Command                       | Description                                                                                      |
| :---------------------------- | :----------------------------------------------------------------------------------------------- |
| `npm install`                 | Install project dependencies.                                                                    |
| `npm run build`               | Full build process: cleans `dist/`, lints, compiles TypeScript (`tsc`), and copies static files. |
| `npm run clean`               | Removes the `build` directory.                                                                   |
| `npm run lint`                | Runs ESLint and checks licenses.                                                                 |
| `npm run test`                | Runs unit tests using Jest.                                                                      |
| `npm run license`             | Updates/Checks license headers in source files.                                                  |
| `npm pack --dry-run`          | Creates a tarball of the package for verification without publishing.                            |
| `npm publish --access public` | Publishes the package to the npm registry.                                                       |

### CLI Usage (Local Testing)

To test the CLI functionality locally without publishing:

```bash
# Compile the project
npm run build

# Run the CLI executable directly
./dist/src/index.js init --help
```

## Development Conventions

- **Code Style**: Follows Google TypeScript Style (GTS) with Prettier and ESLint.
- **License Headers**: All source files must have a license header. Use `npm run license` to apply them.
- **Testing**: Tests are located in the `test/` directory and mirror the structure of `src/`.
- **Dependencies**: The `dependencies` list in `src/config.ts` is critical. It defines what gets installed in the _user's_ project when they run `init`. This list is currently maintained to match a specific internal standard (including packages like `vite`, `vitest`).

## Recent Changes & Context

- **Renaming**: The project was renamed from `@google/aside` to `@wywyjp/wyside`.
- **Customization**: The `init` command has been customized to generate a `package.json` that aligns with specific project requirements (e.g., `quotation-doc-pdf-transformer-gas`), including specific versions for `rollup`, `vitest`, `eslint`, etc.
- **Papaparse**: `papaparse` and its types were explicitly removed from the default configuration.
