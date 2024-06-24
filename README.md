<!--
Copyright 2023 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Apps Script in IDE (ASIDE)

[![NPM Version](https://img.shields.io/npm/v/@google/aside)](https://www.npmjs.com/package/@google/aside)
[![GitHub Action: CI](https://github.com/google/aside/actions/workflows/ci.yml/badge.svg)](https://github.com/google/aside/actions/workflows/ci.yml)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

## Overview

Apps Script in IDE (ASIDE) supports modern, robust and scalable Apps Script development by providing a framework for a local coding environment capable of formatting, linting, testing and much more.

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

```
npx @google/aside init
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

## Troubleshooting

### Unknown token 'export'

While bundling generally resolves all `export`s and `import`s it keeps `export`s in the entrypoint causing `clasp` to fail pushing. This can be an issue for example if you're trying to export functions from `index.ts` for testing.

The recommended approach is to use the entrypoint (`index.ts`) only to expose global functions to Apps Script while importing all business logic from separate modules.

### Module not included in bundle

Bundling includes treeshaking of unused files to keep the bundle size as small as possible. If any of your modules contain only global functions with no import-path leading to the entrypoint (e.g. to be called from the menu), those would not be included in the bundle.

To avoid this, you can use a [side-effect import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#import_a_module_for_its_side_effects_only).

```ts
import './path/to/module';
```

This will ensure that Rollup will not remove it from the bundle.

### The UI is not working on Apps Script

When installing Angular Material, if you chose `Include and enable animations`, you need to make some changes to `src/ui/src/app/app.config.ts`.

ASIDE currently doesn't support chunk files which will be generated for lazy-loading through `provideAnimationsAsync()`.

Change `app.config.ts` to:

```
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations()]
};
```

## Disclaimer

This is not an officially supported Google product.
