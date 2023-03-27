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
    '@rollup/plugin-node-resolve',
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
    'ts-jest',
    'typescript',
  ],
  scripts: {
    clean: 'rimraf build dist',
    lint: 'npm run license:add && eslint --fix src/',
    bundle: 'rollup --no-treeshake -c rollup.config.mjs',
    build: 'npm run clean && npm run bundle',
    test: 'jest test/ --passWithNoTests',
    'license:check': 'license-check-and-add check -f license-config.json',
    'license:add': 'license-check-and-add add -f license-config.json',
    deploy:
      'npm run lint && npm run test && npm run build && ncp appsscript.json dist/appsscript.json && ncp .clasp-dev.json .clasp.json && clasp push',
    'deploy-prod':
      'npm run lint && npm run test && npm run build && ncp appsscript.json dist/appsscript.json && ncp .clasp-prod.json .clasp.json && clasp push',
  },
  filesCopy: {
    '.editorconfig': '.editorconfig',
    '.eslintrc.json': '.eslintrc.json',
    '.prettierrc.json': '.prettierrc.json',
    'jest.config.json': 'jest.config.json',
    LICENSE: 'LICENSE',
    'license-config.json': 'license-config.json',
    'license-header.txt': 'license-header.txt',
    'rollup.config.mjs': 'rollup.config.mjs',
    'tsconfig.json': 'tsconfig.json',
  },
  filesMerge: {
    '.claspignore': '.claspignore',
    '.eslintignore': '.eslintignore',
    '.gitignore-target': '.gitignore',
    '.prettierignore': '.prettierignore',
  },
};
