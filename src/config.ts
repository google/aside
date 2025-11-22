#!/usr/bin/env node
/**
 * Copyright 2025 wywy LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * you may obtain a copy of the License at
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
    '@google/clasp@^2.5.0',
    '@rollup/plugin-commonjs@^28.0.9',
    '@rollup/plugin-node-resolve@^16.0.3',
    '@types/google-apps-script@^2.0.7',
    '@typescript-eslint/eslint-plugin@^8.46.2',
    '@vitest/coverage-v8@^4.0.4',
    '@vitest/ui@^4.0.4',
    'eslint@^9.38.0',
    'eslint-config-prettier@^10.1.8',
    'eslint-plugin-prettier@^5.5.4',
    'factory.ts@^1.4.2',
    'gts@^6.0.2',
    'license-check-and-add@^4.0.5',
    'ncp@^2.0.0',
    'prettier@^3.6.2',
    'rimraf@^6.0.1',
    'rollup@^4.52.5',
    'rollup-plugin-cleanup@^3.2.1',
    'rollup-plugin-license@^3.6.0',
    'rollup-plugin-prettier@^4.1.2',
    'rollup-plugin-typescript2@^0.36.0',
    'ts-node@^10.9.2',
    'typescript@^5.9.3',
    'vite@^7.1.12',
    'vitest@^4.0.4',
  ],
  scripts: {
    'clean': 'rimraf build dist',
    'lint':
      'npm run license && eslint --fix --no-error-on-unmatched-pattern src/ test/',
    'format': 'prettier --write --log-level silent .',
    'bundle': 'rollup --no-treeshake -c rollup.config.mjs',
    'build':
      'npm run clean && npm run bundle && ncp appsscript.json dist/appsscript.json',
    'license': 'license-check-and-add add -f license-config.json',
    'test': 'npm run lint && npx tsc --noEmit && vitest run',
    'deploy':
      'npm run license && npm run build && ncp .clasp-dev.json .clasp.json && clasp push -f',
    'deploy:stg':
      'npm run test && npm run build && ncp .clasp-stg.json .clasp.json && clasp push',
    'deploy:prod':
      'npm run test && npm run build && ncp .clasp-prod.json .clasp.json && clasp push',
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

export const configForAngular: {
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
    '@typescript-eslint/eslint-plugin@^5.55.0',
    'eslint@^8.36.0',
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
      'test -d src/ui || (cd src/ && ng new --skip-git --skip-tests=true --routing=false --ssr=false --standalone ui && cd ui/ && ng add --skip-confirmation @angular/material)',
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
    'fix-animations': 'node fix-animations.mjs',
    'postinstall': 'npm run fix-animations && cd src/ui && npm install',
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
    'fix-animations.mjs': 'fix-animations.mjs',
    'tsconfig.json': 'tsconfig.json',
  },
  filesMerge: {
    'dist/.gitignore-target': '.gitignore',
    '.claspignore': '.claspignore',
    '.eslintignore': '.eslintignore',
    '.prettierignore': '.prettierignore',
  },
};

export const configForSvelte: {
  dependencies: string[];
  scripts: PackageJson.Scripts;
  filesCopy: Record<string, string>;
  filesMerge: Record<string, string>;
} = {
  dependencies: [...config.dependencies, 'fs-extra@^11.1.0'],
  scripts: {
    ...config.scripts,
    'preinstall': 'node setup-svelte.mjs',
    'build-ui': 'npm run build --prefix src/ui',
    'deploy-ui': 'node deploy-ui.mjs src/ui/dist',
    'deploy':
      'npm run license && npm run build && ncp appsscript.json dist/appsscript.json && ncp .clasp-dev.json .clasp.json && npm run build-ui && npm run deploy-ui && clasp push -f',
    'deploy:prod':
      'npm run test && npm run build && ncp appsscript.json dist/appsscript.json && ncp .clasp-prod.json .clasp.json && npm run build-ui && npm run deploy-ui && clasp push',
    'serve-ui': 'cd src/ui && npm run dev',
    'postinstall': 'cd src/ui && npm install',
  },
  filesCopy: {
    ...config.filesCopy,
    'deploy-ui.mjs': 'deploy-ui.mjs',
    'setup-svelte.mjs': 'setup-svelte.mjs',
  },
  filesMerge: config.filesMerge,
};

export const configForUi = configForAngular;
