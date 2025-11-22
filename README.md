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

# wyside

- **Note**: This is a community-maintained fork of [@wywyjp/wyside](https://github.com/google/aside).
- The original project is created by Google but is not officially supported.

## Overview

wyside supports modern, robust and scalable Apps Script development by providing a framework for a local coding environment capable of formatting, linting, testing and much more.

Here are the main features:

- **TypeScript**

  Write your code in TypeScript. It will be automatically compiled and bundled when deploying

- **Formatting / Linting**

  Leverage the power of ESLint and Prettier to enforce a unique coding style amongst collaborators

- **Testing**

  Use Jest to test your code before deploying

- **Multiple Environments**

  Seemlessly switch between `dev` and `prod` environments to push your code to

## Getting Started

The simplest way to get started is:

```bash
npx @wywyjp/wyside init
```

## What it does

After running the `init` command above, ASIDE will go ahead and do the following:

- **Add configuration files**

  E.g. for ESLint, Prettier, Jest, ...

- **Set convenience scripts in package.json**

  Those scripts include: `lint`, `build` and `deploy`, among others

- **Install necessary dependencies**

  Everything required for formatting, linting, testing, etc. will be installed automatically

- **Set up clasp**

  ASIDE is using [clasp](https://github.com/google/clasp) to pull and push code from and to Apps Script

- **(Optionally) Create an Angular Material UI**

  ASIDE will run the necessary commands to create an Angular application with Angular Material components, if the option is chosen

## UI Development

If you chose to create an Angular UI during initialization, you can find the source code in `src/ui`. This is a standard Angular application.

### Development

To run the UI locally during development:

```bash
npm run serve-ui
```

This will start the Angular development server (usually at <http://localhost:4200>).

### Deployment

To deploy your project including the UI to Google Apps Script:

```bash
npm run deploy
```

This command automates the following steps:

1. Builds the Angular application.
2. Converts the build artifacts into GAS-compatible HTML files (using `deploy-ui.mjs`).
3. Pushes the code to your Apps Script project using `clasp`.

### Server-side Integration

Ensure your GAS server-side code (e.g., `src/index.ts`) is set up to serve the UI. You typically need a `doGet` function and an `include` helper:

```typescript
function doGet() {
  return HtmlService.createTemplateFromFile('ui')
    .evaluate()
    .setTitle('My App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename: string) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

## Options

You can provide the `init` command with some convenience options:

- `--yes` / `-y`

  Answer 'yes' to all prompts

- `--no` / `-n`

  Answer 'no' to all prompts

- `--title`/ `-t`

  Set project title without being asked for it

- `--script-dev`

  Set Script ID for dev environment without being asked for it

- `--script-prod`

  Set Script ID for production environment without being asked for it
