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
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import { PackageJson } from 'type-fest';
import writeFileAtomic from 'write-file-atomic';
import { compare } from './compare';

export interface PackageInstallResult {
  requested: string[];
  resolved: string[];
  installed: string[];
}

/** The default package.json path in the current working directory. */
export const DEFAULT_PACKAGE_JSON_PATH = './package.json';
const DEFAULT_PACKAGE_JSON_CONTENT: PackageJson = {
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
 * Reformats an arbitrary string into a lower-case-dashed package name.
 * @param {string} name the project name
 * @returns {string} the reformatted package name
 */
function toPackageName(name: string) {
  return name
    ?.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * A collection of utilities for interacting with package.json files.
 */
export class PackageHelper {
  constructor(
    private content: PackageJson = {},
    private readonly path = DEFAULT_PACKAGE_JSON_PATH
  ) {}

  /**
   * Returns a snapshot of the currently loaded package.json.
   * @returns {PackageJson} the package.json content
   */
  getContent() {
    return JSON.parse(JSON.stringify(this.content)) as PackageJson;
  }

  /**
   * Returns the package.json's package name
   * @returns {string} the name of the current package
   */
  getName() {
    return this.content.name;
  }

  /**
   * Returns a snapshot of the package.json's script section.
   * @returns {PackageJson.Scripts} the scripts of the current package
   */
  getScripts(): PackageJson.Scripts {
    return this.getContent().scripts ?? {};
  }

  /**
   * Returns a snapshot of the package.json's dependency section.
   *
   * Specify the includeDevDependencies flag in order to retrieve a merge of
   * the dependencies and development dependencies.
   *
   * @param {boolean} [includeDevDependencies=false] whether to include
   *  devDependencies
   * @returns {PackageJson.Dependency} the dependencies of the current package
   */
  getDependencies(includeDevDependencies = false): PackageJson.Dependency {
    const content = this.getContent();
    const dependencies = content.dependencies ?? {};
    if (includeDevDependencies) {
      return { ...dependencies, ...content.devDependencies };
    }
    return dependencies;
  }

  /**
   * Returns a snapshot of the package.json's dependency package names.
   *
   * Specify the includeDevDependencies flag in order to retrieve a merge of
   * the dependency and development dependency package names.
   *
   * @param {boolean} [includeDevDependencies=false] whether to include
   *  devDependencies
   * @returns {string[]} the dependency package names
   */
  getDependencyPackages(includeDevDependencies = false): string[] {
    return Object.keys(this.getDependencies(includeDevDependencies));
  }

  /**
   * Updates the name of the current package.
   *
   * This function reformats the input name into a valid package name (i.e.
   * lower-case-dashed format) and returns the valid package name.
   *
   * @param {string} name the new name of the package
   * @returns {string} the reformatted package name
   */
  updateName(name: string): string {
    return (this.content.name = toPackageName(name));
  }

  /**
   * Updates a single script entry in the current package.
   *
   * @param {string} name the name of the script.
   * @param {string} script the script content.
   * @returns {PackageJson.Scripts} a snapshot of the updated scripts section.
   */
  updateScript(name: string, script: string): PackageJson.Scripts {
    if (!this.content.scripts) {
      this.content.scripts = {};
    }
    this.content.scripts = { ...this.getScripts(), [name]: script };
    return this.getScripts();
  }

  /**
   * Installs a list of packages at their current version.
   *
   * Note this function computes the missing packages and only installs those.
   * The function returns an install result containing information, which
   * packages were requested, which ones already existed and which ones were
   * installed.
   *
   * @param {string[]} packages the packages to install.
   * @returns {PackageInstallResult} information about the installation.
   */
  installPackages(packages: string[]): PackageInstallResult {
    const packagesToInstall = compare(
      this.getDependencyPackages(true),
      packages
    ).right;

    if (packagesToInstall.length === 0) {
      return {
        requested: packages,
        resolved: packages,
        installed: [],
      };
    }

    const executionResult = spawn.sync(
      'npm',
      ['install', '--ignore-scripts', '--silent'].concat(packagesToInstall),
      { encoding: 'utf-8' }
    );
    if (executionResult.stderr) {
      throw new Error(executionResult.stderr);
    }

    // sync with new saved dependencies after install
    const packageJsonOnDisk = PackageHelper.load(this.path);
    if (!packageJsonOnDisk) {
      throw new Error('Cannot find package.json');
    }
    const packageDiff = compare(
      this.getDependencyPackages(true),
      packageJsonOnDisk.getDependencyPackages(true)
    );
    this.content = packageJsonOnDisk.getContent();
    return {
      requested: packages,
      resolved: packageDiff.both,
      installed: packageDiff.right,
    };
  }

  /**
   * Writes the package.json to disk.
   * @returns {Promise<PackageHelper>} this package helper.
   */
  async save(): Promise<PackageHelper> {
    await writeFileAtomic(
      this.path,
      `${JSON.stringify(this.content, null, '  ')}\n`
    );
    return this;
  }

  /**
   * Loads the contents of a package.json from the current directory.
   * @returns {PackageHelper|undefined} a package helper with the current package.json
   *  information.
   */
  static load(path = DEFAULT_PACKAGE_JSON_PATH): PackageHelper | undefined {
    try {
      return new PackageHelper(fs.readJsonSync(path), path);
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
        return undefined;
      } else {
        // unexpected error
        throw e;
      }
    }
  }

  /**
   * Initializes a package.json with default values.
   * @param {string} name the package name
   * @param {string} [path] optionally, a path different from the default
   *  package.json path.
   * @returns {PackageHelper} a package helper with the current package.json
   *  information.
   */
  static init(name: string, path = DEFAULT_PACKAGE_JSON_PATH) {
    return new PackageHelper(
      {
        ...DEFAULT_PACKAGE_JSON_CONTENT,
        name: toPackageName(name),
      },
      path
    );
  }
}
