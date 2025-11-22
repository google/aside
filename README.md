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

- **Note**: This is a community-maintained fork of [@google/aside](https://github.com/google/aside).
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
