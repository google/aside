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

import fs from 'fs-extra';
import writeFileAtomic from 'write-file-atomic';
import { PackageJson } from 'type-fest';
import spawn from 'cross-spawn';

/**
 * Helper class to wrap clasp utilities.
 */
export class PackageHelper {
  private packageJson: PackageJson = {};
  private readonly defaultPackageJson: PackageJson = {
    name: '',
    version: '0.0.0',
    description: '',
    main: 'build/index.js',
    license: 'Apache-2.0',
    keywords: [],
    scripts: {},
    engines: {
      node: '>=12',
    },
  };

  /**
   * Set packageJson from existing package.json or generate a default one.
   *
   * @param {string} name
   * @param {function} createCallback
   * @returns {Promise<boolean>}
   */
  async init(
    name: string,
    createCallback: () => Promise<boolean>
  ): Promise<boolean> {
    this.packageJson = this.load() ?? ({} as PackageJson);

    if (
      Object.keys(this.packageJson).length === 0 &&
      (await createCallback())
    ) {
      this.packageJson = this.defaultPackageJson;
      this.packageJson.name = this.toValidName(name);

      return true;
    }

    return false;
  }

  /**
   * Load package.json.
   *
   * @returns {PackageJson | undefined}
   */
  load(): PackageJson | undefined {
    try {
      return fs.readJsonSync('./package.json');
    } catch (e) {
      const err = e as Error & { code?: string };

      if (err.code !== 'ENOENT') {
        throw new Error(`Unable to open package.json file: ${err.message}`);
      }
    }
  }

  /**
   * Convert input string to lowercase-dashed-string.
   *
   * @param {string} name
   * @returns {string | undefined}
   */
  toValidName(name?: string): string | undefined {
    return name
      ?.replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Write package.json to filesystem.
   */
  async write() {
    await writeFileAtomic(
      './package.json',
      `${JSON.stringify(this.packageJson, null, '  ')}\n`
    );
  }

  /**
   * Get package.json scripts.
   *
   * @returns {PackageJson.Scripts}
   */
  getScripts(): PackageJson.Scripts {
    return this.packageJson.scripts ?? {};
  }

  /**
   * Determine and return missing dependencies from set of target dependencies.
   *
   * @param {string[]} targetDependencies
   * @returns {string[]}
   */
  getMissingDependencies(targetDependencies: string[]): string[] {
    return this.packageJson.dependencies !== undefined
      ? targetDependencies.filter(
          dep => !Object.keys(this.packageJson.dependencies ?? {}).includes(dep)
        )
      : targetDependencies;
  }

  /**
   * Install dependencies from list.
   *
   * @param {string[]} deps
   * @returns {Promise<boolean>} Indicating whether dependencies were installed
   */
  async installDependencies(deps: string[]): Promise<boolean> {
    const missingDependencies = this.getMissingDependencies(deps);

    if (missingDependencies.length === 0) return false;

    const res = spawn.sync(
      'npm',
      ['install', '--ignore-scripts', '--silent'].concat(deps),
      { encoding: 'utf-8' }
    );

    if (res.stderr) {
      throw new Error(res.stderr);
    }

    return true;
  }

  /**
   * Update scripts.
   *
   * @param {PackageJson.Scripts} targetScripts
   * @param {function} existsCallback
   * @returns {Promise<boolean>} Indicating if scripts were modified
   */
  async updateScripts(
    targetScripts: PackageJson.Scripts,
    existsCallback: (
      scriptName: string,
      sourceScript: string,
      targetScript: string
    ) => Promise<boolean>
  ): Promise<boolean> {
    if (!this.packageJson.scripts) {
      this.packageJson.scripts = {};
    }

    let modified = false;

    for (const scriptName of Object.keys(targetScripts)) {
      const source = this.packageJson.scripts[scriptName];
      const target = targetScripts[scriptName];

      if (source && target && source !== target) {
        const install = await existsCallback(scriptName, source, target);

        if (!install) continue;
      }

      this.packageJson.scripts[scriptName] = target;
      modified = true;
    }

    return modified;
  }
}
