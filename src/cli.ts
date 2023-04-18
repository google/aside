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

import chalk from 'chalk';
import fs from 'fs-extra';
import meow from 'meow';
import path from 'path';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import writeFileAtomic from 'write-file-atomic';

import { ClaspHelper } from './clasp-helper.js';
import { config } from './config.js';
import { PackageHelper } from './package-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cli = meow(
  `
	Usage
	  $ @google/aside init [options]

	Options
	  --help        Prints this help message
    --title, -t   Project title
    --yes, -y     Assume yes for every prompt
    --no, -n      Assume no for every prompt
    --script-dev  Script ID for dev environment
    --script-prod Script ID for production environment

    Examples
    $ @google/aside init -y
    $ @google/aside init --title "Cool Title"
`,
  {
    importMeta: import.meta,
    flags: {
      title: {
        type: 'string',
        alias: 't',
      },
      yes: {
        type: 'boolean',
        alias: 'y',
      },
      no: {
        type: 'boolean',
        alias: 'n',
      },
    },
  }
);

export interface Options {
  yes: boolean;
  no: boolean;
  title: string;
}

/**
 * Handle package.json creation and update.
 *
 * @param {Options} options
 */
export async function handlePackageJson(options: Options) {
  let needsSave = false;

  // Load or initialize a package.json
  let packageJson = PackageHelper.load();
  if (!packageJson) {
    const init = await query(
      '',
      `Generate ${chalk.bold('package.json')}?`,
      true,
      options
    );
    if (init) {
      packageJson = PackageHelper.init(options.title);
    } else {
      packageJson = new PackageHelper();
    }
    needsSave = true;
  }

  // Synchronize scripts
  console.log(`${chalk.green('\u2714')}`, 'Adding scripts...');
  const existingScripts = packageJson.getScripts();
  for (const [name, script] of Object.entries(config.scripts)) {
    if (name in existingScripts) {
      const replace = await query(
        `package.json already has a script for ${chalk.bold(name)}:\n` +
          `-${chalk.red(existingScripts[name])}\n+${chalk.green(script)}`,
        'Replace',
        false,
        options
      );
      if (replace) {
        packageJson.updateScript(name, script);
        needsSave = true;
      }
    } else {
      packageJson.updateScript(name, script);
      needsSave = true;
    }
  }

  // Write if changed
  if (needsSave) {
    console.log(`${chalk.green('\u2714')}`, 'Saving package.json...');
    await packageJson.save();
  }

  // Install dev dependencies
  console.log(`${chalk.green('\u2714')}`, 'Installing dependencies...');
  packageJson.installPackages(config.dependencies);
}

/**
 * Prompt user for text input.
 *
 * @param {string} message
 * @param {string} defaultVal
 * @param {Options} options
 * @returns {Promise<string>}
 */
async function queryText(
  message: string,
  defaultVal: string,
  options: Options
): Promise<string> {
  if (options.yes) {
    return defaultVal;
  }

  const response = await prompts({
    type: 'text',
    name: 'answer',
    message: `${message}:`,
    initial: defaultVal,
  });

  return response.answer;
}

/**
 * Prompt user for toggle input.
 *
 * @param {string} message
 * @param {string} question
 * @param {string} defaultVal
 * @param {Options} options
 * @returns {Promise<boolean>}
 */
async function query(
  message: string,
  question: string,
  defaultVal: boolean,
  options: Options
): Promise<boolean> {
  if (options.yes) {
    return true;
  } else if (options.no) {
    return false;
  }

  if (message) {
    console.log(message);
  }

  const answer = await prompts({
    type: 'toggle',
    name: 'result',
    message: question,
    initial: defaultVal,
    active: 'Yes',
    inactive: 'No',
  });

  return answer.result;
}

/**
 * Read file.
 *
 * @param {string} path
 * @returns {Promise<string>}
 */
async function readFile(path: string): Promise<string | undefined> {
  try {
    return await fs.readFile(path, 'utf8');
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err.code !== 'ENOENT') {
      throw new Error(`Unknown error reading ${path}: ${err.message}`);
    }
  }

  return undefined;
}

/**
 * Handle config merge.
 * Compares source and target config files and merges if required.
 *
 * @param {Options} options
 */
async function handleConfigMerge(options: Options) {
  for (const filename of Object.keys(config.filesMerge)) {
    const sourcePath = path.join(__dirname, '../../', filename);
    let sourceLines = (await readFile(sourcePath))?.split('\n');

    const targetFile = await readFile(config.filesMerge[filename]);
    const targetLines = targetFile?.split('\n') ?? [];

    const missingLines =
      sourceLines?.filter(item => targetLines.indexOf(item) === -1) ?? [];

    if (missingLines.length === 0) continue;

    if (targetFile !== undefined) {
      const message =
        `${chalk.bold(
          config.filesMerge[filename]
        )} already exists but is missing content\n` +
        missingLines.map(line => `+${chalk.green(line)}`).join('\n');

      const writeFile = await query(message, 'Merge', false, options);

      if (!writeFile) continue;
    }

    sourceLines = targetLines.concat(missingLines);

    await writeFileAtomic(
      config.filesMerge[filename],
      `${sourceLines.filter(item => item).join('\n')}\n`
    );
  }
}

/**
 * Handle config copy.
 *
 * @param {Options} options
 */
async function handleConfigCopy(options: Options) {
  for (const filename of Object.keys(config.filesCopy)) {
    try {
      const sourcePath = path.join(__dirname, '../../', filename);
      const source = await readFile(sourcePath);
      const target = await readFile(config.filesCopy[filename]);

      if (source === target || typeof source === 'undefined') continue;

      const writeFile = target
        ? await query(
            `${chalk.bold(config.filesCopy[filename])} already exists`,
            'Overwrite',
            false,
            options
          )
        : true;

      if (writeFile) {
        await writeFileAtomic(config.filesCopy[filename], source);
      }
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code !== 'ENOENT') {
        throw new Error(`Unknown error reading ${path}: ${err.message}`);
      }
    }
  }
}

/**
 * Copy template if no .ts files in src/.
 */
export async function handleTemplate() {
  const cwd = process.cwd();
  const sourceDirName = path.join(__dirname, '../../template');
  const targetDirName = path.join(cwd, 'src');

  try {
    fs.mkdirSync(targetDirName);
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }

  // Only install the template if no ts files exist in target directory.
  const files = fs.readdirSync(targetDirName);
  const tsFiles = files.filter((file: string) =>
    file.toLowerCase().endsWith('.ts')
  );

  if (tsFiles.length === 0) {
    console.log(`${chalk.green('\u2714')}`, 'Installing default template...');
    fs.copySync(sourceDirName, targetDirName, { overwrite: false });
  }
}

/**
 * Set up clasp.
 *
 * @param {Options} options
 */
async function handleClasp(options: Options) {
  const claspHelper = new ClaspHelper();

  await claspHelper.login();

  const claspConfigExists = await claspHelper.isConfigured();

  const overrideClasp = claspConfigExists
    ? await query('', 'Override existing clasp config?', false, options)
    : false;

  if (claspConfigExists && !overrideClasp) {
    return;
  }

  const scriptIdDev = await queryText('Script ID (optional)', '', options);
  const scriptIdProd = await queryText(
    'Script ID for production environment (optional)',
    scriptIdDev,
    options
  );

  // Prepare clasp project environment
  if (scriptIdDev) {
    console.log(`${chalk.green('\u2714')}`, `Cloning ${scriptIdDev}...`);
    claspHelper.cloneAndPull(scriptIdDev, scriptIdProd, 'dist');
  } else {
    console.log(`${chalk.green('\u2714')}`, `Creating ${options.title}...`);
    const res = await claspHelper.create(options.title, scriptIdProd, './dist');

    // Output URLs
    console.log();
    console.log('-> Google Sheets Link:', res.sheetLink);
    console.log('-> Apps Script Link:', res.scriptLink);
    console.log();
  }
}

/**
 * Handle environment initialization.
 */
export async function init() {
  const projectTitle =
    cli.flags.title ??
    (await queryText('Project Title', 'Untitled', {
      yes: cli.flags.yes,
      no: cli.flags.no,
    } as Options));

  const options: Options = {
    yes: cli.flags.yes || false,
    no: cli.flags.no || false,
    title: projectTitle,
  };

  // Handle package.json
  await handlePackageJson(options);

  // Handle config copy
  await handleConfigCopy(options);

  // Handle config merge
  await handleConfigMerge(options);

  // Handle template
  await handleTemplate();

  // Handle clasp
  await handleClasp(options);
}

/**
 * Main entry point to coordinate execution based on verb.
 *
 * @param {string} verb
 */
async function run(verb: string) {
  try {
    if (verb === 'init') {
      await init();
    }
  } catch (err) {
    const error = err as Error;
    console.log(error.message);
  }
}

run(cli.input[0]);
