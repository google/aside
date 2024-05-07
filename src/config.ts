#!/usr/bin/env node
/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PackageJson } from 'type-fest';

export const config: {
  dependencies: string[];
  scripts: PackageJson.Scripts;
  filesCopy: Record<string, string>;
  filesMerge: Record<string, string>;
} = {
  dependencies: [
    '@google/clasp',
    '@types/google-apps-script',
    '@types/jest',
    '@typescript-eslint/eslint-plugin',
    'eslint',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'gts',
    'jest',
    'license-check-and-add',
    'ncp',
    'prettier',
    'rimraf',
    'rollup',
    'rollup-plugin-cleanup',
    'rollup-plugin-license',
    'rollup-plugin-prettier',
    'rollup-plugin-typescript2',
    'ts-jest',
    'typescript',
  ],
  scripts: {
    'clean': 'rimraf build dist',
    'lint':
      'npm run license && eslint --fix --no-error-on-unmatched-pattern src/ test/',
    'bundle': 'rollup --no-treeshake -c rollup.config.mjs',
    'build':
      'npm run clean && npm run bundle && ncp appsscript.json dist/appsscript.json',
    'license': 'license-check-and-add add -f license-config.json',
    'test': 'jest test/ --passWithNoTests --detectOpenHandles',
    'deploy':
      'npm run lint && npm run test && npm run build && ncp .clasp-dev.json .clasp.json && clasp push -f',
    'deploy:prod':
      'npm run lint && npm run test && npm run build && ncp .clasp-prod.json .clasp.json && clasp push',
  },
  filesCopy: {
    '.editorconfig': '.editorconfig',
    '.eslintrc.json': '.eslintrc.json',
    '.prettierrc.json': '.prettierrc.json',
    'jest.config.json': 'jest.config.json',
    'LICENSE': 'LICENSE',
    'license-config.json': 'license-config.json',
    'license-header.txt': 'license-header.txt',
    'rollup.config.mjs': 'rollup.config.mjs',
    'tsconfig.json': 'tsconfig.json',
  },
  filesMerge: {
    'dist/.gitignore-target': '.gitignore',
    '.claspignore': '.claspignore',
    '.eslintignore': '.eslintignore',
    '.prettierignore': '.prettierignore',
  },
};

export const configForUi: {
  dependencies: string[];
  scripts: PackageJson.Scripts;
  filesCopy: Record<string, string>;
  filesMerge: Record<string, string>;
} = {
  dependencies: [
    '@angular/cli',
    '@google/clasp',
    '@types/google-apps-script',
    '@types/jest',
    '@typescript-eslint/eslint-plugin',
    'eslint',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'fs-extra',
    'gts',
    'inquirer@^8.0.0',
    'jest',
    'license-check-and-add',
    'ncp',
    'prettier',
    'rimraf',
    'rollup',
    'rollup-plugin-cleanup',
    'rollup-plugin-license',
    'rollup-plugin-prettier',
    'rollup-plugin-typescript2',
    'ts-jest',
    'typescript',
  ],
  scripts: {
    'preinstall':
      'test -d src/ui || (cd src/ && ng new --skip-git --skip-tests=true --routing=false --ssr=false --style=css --standalone ui && cd ui/ && ng add --skip-confirmation @angular/material)',
    'clean': 'rimraf build dist',
    'lint':
      'npm run license && eslint --fix --no-error-on-unmatched-pattern src/ test/',
    'bundle': 'rollup --no-treeshake -c rollup.config.mjs',
    'build': 'npm run clean && npm run bundle',
    'build-ui': 'npm run build --prefix src/ui',
    'license': 'license-check-and-add add -f license-config.json',
    'test': 'jest test/ --passWithNoTests --detectOpenHandles',
    'test-ui': 'npm run test --prefix src/ui',
    'deploy':
      'npm run lint && npm run test && npm run build && ncp appsscript.json dist/appsscript.json && ncp .clasp-dev.json .clasp.json && npm run build-ui && npm run deploy-ui && clasp push -f',
    'deploy-ui': 'node deploy-ui.mjs',
    'deploy:prod':
      'npm run lint && npm run test && npm run build && ncp appsscript.json dist/appsscript.json && ncp .clasp-prod.json .clasp.json && npm run build-ui && npm run deploy-ui && clasp push',
    'serve-ui': 'cd src/ui && ng serve',
    'postinstall': 'cd src/ui && npm install',
  },
  filesCopy: {
    '.editorconfig': '.editorconfig',
    '.eslintrc.json': '.eslintrc.json',
    '.prettierrc.json': '.prettierrc.json',
    'jest.config.json': 'jest.config.json',
    'LICENSE': 'LICENSE',
    'license-config.json': 'license-config.json',
    'license-header.txt': 'license-header.txt',
    'rollup.config.mjs': 'rollup.config.mjs',
    'deploy-ui.mjs': 'deploy-ui.mjs',
    'tsconfig.json': 'tsconfig.json',
  },
  filesMerge: {
    'dist/.gitignore-target': '.gitignore',
    '.claspignore': '.claspignore',
    '.eslintignore': '.eslintignore',
    '.prettierignore': '.prettierignore',
  },
};
