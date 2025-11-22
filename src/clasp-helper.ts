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

import spawn from 'cross-spawn';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import writeFileAtomic from 'write-file-atomic';

/**
 * Helper class to wrap clasp utilities.
 */
export class ClaspHelper {
  /**
   * Check if ~/.clasprc.json exists.
   *
   * @returns {Promise<boolean>}
   */
  private async isLoggedIn() {
    return await fs.exists(path.join(os.homedir(), '.clasprc.json'));
  }

  /**
   * Perform 'clasp login'.
   */
  async login() {
    const loggedIn = await this.isLoggedIn();

    if (!loggedIn) {
      spawn.sync('npx', ['clasp', 'login'], { stdio: 'inherit' });
    }
  }

  /**
   * Check if clasp is already set up.
   *
   * @returns {Promise<boolean>}
   */
  async isConfigured() {
    return (
      (await fs.exists('.clasp-dev.json')) ||
      (await fs.exists(path.join('dist', '.clasp.json')))
    );
  }

  /**
   * Remove all clasp related artifacts (e.g. for re-install).
   *
   * @param {string} rootDir
   */
  async clean(rootDir: string) {
    // Remove all clasp project artifacts
    await fs.rm(path.join(rootDir, '.clasp.json'), {
      recursive: true,
      force: true,
    });
    await fs.rm('appsscript.json', { force: true });
    await fs.rm('.clasp.json', { force: true });
    await fs.rm('.clasp-dev.json', { force: true });
    await fs.rm('.clasp-prod.json', { force: true });

    // Make sure root dir exists
    await fs.mkdirs(rootDir);
  }

  /**
   * Extract Google Sheets link from 'clasp create' output.
   * @param {string} output
   * @returns {string}
   */
  extractSheetsLink(output: string) {
    const sheetsLink = output.match(/Created new document: ([^\n]*)/);

    return sheetsLink?.length ? sheetsLink[1] : 'Not found';
  }

  /**
   * Extract Google Apps Script link from 'clasp create' output.
   * @param {string} output
   * @returns {string}
   */
  extractScriptLink(output: string) {
    const scriptLink = output.match(/Created new script: ([^\n]*)/);

    return scriptLink?.length ? scriptLink[1] : 'Not found';
  }

  /**
   * Perform 'clasp create'.
   *
   * @param {string} title
   * @param {string} scriptIdProd
   * @param {string} rootDir
   * @returns {Promise<{sheetLink: string, scriptLink: string}>}
   */
  async create(title: string, scriptIdProd: string, rootDir: string) {
    await this.clean(rootDir);

    const res = spawn.sync(
      'npx',
      [
        'clasp',
        'create-script',
        '--type',
        'sheets',
        '--rootDir',
        rootDir,
        '--title',
        `${title}`,
      ],
      { encoding: 'utf-8' }
    );

    this.arrangeFiles(rootDir, scriptIdProd);

    // Extract URLs from output
    const output = res.output.join();

    return {
      sheetLink: this.extractSheetsLink(output),
      scriptLink: this.extractScriptLink(output),
    };
  }

  /**
   * Put files in their designated place after (e.g. after create or clone).
   *
   * @param {string} rootDir
   * @param {?string} scriptIdProd
   */
  async arrangeFiles(rootDir: string, scriptIdProd?: string) {
    await fs.move('.clasp.json', '.clasp-dev.json');

    await fs.move(path.join(rootDir, 'appsscript.json'), 'appsscript.json');

    if (scriptIdProd) {
      this.writeConfig(scriptIdProd, rootDir, '.clasp-prod.json');
    } else {
      await fs.copyFile('.clasp-dev.json', '.clasp-prod.json');
    }
  }

  /**
   * Perform 'clasp clone' and 'clasp pull'.
   * @param {string} scriptIdDev
   * @param {string} scriptIdProd
   * @param {string} rootDir
   */
  async cloneAndPull(
    scriptIdDev: string,
    scriptIdProd: string,
    rootDir: string
  ) {
    await this.clean(rootDir);

    // Write .clasp.json
    await this.writeConfig(scriptIdDev, rootDir);

    // Copy .clasp.json to clasp root dir
    await fs.copyFile('.clasp.json', path.join(rootDir, '.clasp.json'));

    spawn.sync('npx', ['clasp', 'clone'], { stdio: 'inherit' });
    spawn.sync('npx', ['clasp', 'pull'], { stdio: 'inherit' });

    // Copy/Move files to their designated place
    await this.arrangeFiles(rootDir, scriptIdProd);
  }

  /**
   * Generate and write clasp config.
   *
   * @param {string} scriptId
   * @param {string} rootDir
   * @param {string=} filename
   */
  async writeConfig(
    scriptId: string,
    rootDir: string,
    filename: string | undefined = '.clasp.json'
  ) {
    const claspConfig = {
      scriptId: scriptId,
      rootDir: rootDir,
    };

    await writeFileAtomic(filename, JSON.stringify(claspConfig));
  }
}
