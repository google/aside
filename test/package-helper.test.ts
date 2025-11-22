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
import { SpawnSyncReturns } from 'child_process';
import spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import { PackageHelper } from '../src/package-helper';

jest.mock('fs-extra');

describe('package-helper', () => {
  describe('load', () => {
    //const pkgHelper = new PackageHelper();
    it('returns undefined if no package.json found', () => {
      jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => {
        const err: NodeJS.ErrnoException = new Error('file not found');
        err.code = 'ENOENT';
        throw err;
      });

      const pkgHelper = PackageHelper.load();

      expect(pkgHelper).toBe(undefined);
    });

    it('returns package.json if found', () => {
      const expected = {
        name: 'project',
      };

      jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => {
        return expected;
      });

      const pkgHelper = PackageHelper.load();
      expect(pkgHelper).not.toBe(undefined);
      expect(pkgHelper!.getContent()).toEqual(expected);
    });

    it('throws an error for unexpected exceptions', () => {
      jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => {
        throw new Error();
      });

      expect(PackageHelper.load).toThrow();
    });
  });

  describe('init', () => {
    it('uses default package if no package.json found', async () => {
      jest.spyOn(PackageHelper, 'load').mockReturnValue(undefined);

      const res = PackageHelper.init('test');

      expect(res.getContent()).toEqual({
        name: 'test',
        version: '0.0.0',
        description: '',
        main: 'build/index.js',
        license: 'Apache-2.0',
        keywords: [],
        scripts: {},
        engines: {
          node: '>=22',
        },
      });
    });
  });

  describe('getContent', () => {
    it('returns the current package.json contents', () => {
      const content = { name: 'test', main: 'index.js' };
      const pkgHelper = new PackageHelper(content);

      expect(pkgHelper.getContent()).toEqual(content);
    });
    it('returns a copy of the current package.json content', () => {
      const content = { name: 'test', main: 'index.js' };
      const pkgHelper = new PackageHelper(content);

      const pkgContent = pkgHelper.getContent();
      pkgContent.name = 'test1234';

      expect(pkgHelper.getContent().name).toEqual('test');
    });
  });

  describe('getName', () => {
    it('returns the current package name', () => {
      const pkgHelper = new PackageHelper({ name: 'test' });

      expect(pkgHelper.getName()).toBe('test');
    });
  });

  describe('updateName', () => {
    const pkgHelper = new PackageHelper();

    it('converts string to valid name', () => {
      const res = pkgHelper.updateName('Some CoolTitle Here');

      expect(res).toEqual('some-cool-title-here');
    });
  });

  describe('getScripts', () => {
    it('returns empty object if no scripts', () => {
      const pkgHelper = new PackageHelper();

      const scripts = pkgHelper.getScripts();

      expect(scripts).toEqual({});
    });

    it('returns an object if scripts are defined', () => {
      const pkg = {
        name: 'test',
        scripts: {
          test: 'some script',
        },
      };
      const pkgHelper = new PackageHelper(pkg);

      const scripts = pkgHelper.getScripts();

      expect(scripts).toEqual(pkg.scripts);
    });
  });

  describe('updateScript', () => {
    it('adds a non-existent script', () => {
      const pkgHelper = new PackageHelper({ scripts: { a: 'test' } });

      pkgHelper.updateScript('b', 'test');
      const newScripts = pkgHelper.getScripts();

      expect(newScripts['b']).toEqual('test');
    });
    it('overwrites an existing script', () => {
      const pkgHelper = new PackageHelper({ scripts: { a: 'test' } });

      pkgHelper.updateScript('a', 'test1234');
      const newScripts = pkgHelper.getScripts();

      expect(newScripts['a']).toEqual('test1234');
    });
  });

  describe('installDependencies', () => {
    const spawnSuccessResult = {
      stderr: '',
    } as SpawnSyncReturns<string>;
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('installs dependencies', async () => {
      const pkgBeforeInstall = {};
      const pkgAfterInstall = {
        dependencies: { pkg1: '=0.0.1', pkg2: '=0.0.1' },
      };

      const spawnSyncSpy = jest
        .spyOn(spawn, 'sync')
        .mockImplementationOnce(() => spawnSuccessResult);
      const loadSpy = jest
        .spyOn(PackageHelper, 'load')
        .mockImplementationOnce(() => new PackageHelper(pkgAfterInstall));
      const pkgHelper = new PackageHelper(pkgBeforeInstall);

      const result = pkgHelper.installPackages(['pkg1', 'pkg2']);

      expect(spawnSyncSpy).toHaveBeenCalledWith(
        'npm',
        ['install', '--ignore-scripts', '--silent', 'pkg1', 'pkg2'],
        { encoding: 'utf-8' }
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(result).toEqual({
        requested: ['pkg1', 'pkg2'],
        installed: ['pkg1', 'pkg2'],
        resolved: [],
      });
    });

    it('only install missing dependencies', () => {
      const pkgBeforeInstall = {
        dependencies: { pkg1: '=0.0.1' },
      };
      const pkgAfterInstall = {
        dependencies: { pkg1: '=0.0.1', pkg2: '=0.0.1' },
      };
      const spawnSyncSpy = jest
        .spyOn(spawn, 'sync')
        .mockImplementationOnce(() => spawnSuccessResult);
      const loadSpy = jest
        .spyOn(PackageHelper, 'load')
        .mockImplementationOnce(() => new PackageHelper(pkgAfterInstall));
      const pkgHelper = new PackageHelper(pkgBeforeInstall);

      const result = pkgHelper.installPackages(['pkg1', 'pkg2']);

      expect(spawnSyncSpy).toHaveBeenCalledWith(
        'npm',
        ['install', '--ignore-scripts', '--silent', 'pkg2'],
        { encoding: 'utf-8' }
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(result).toEqual({
        requested: ['pkg1', 'pkg2'],
        installed: ['pkg2'],
        resolved: ['pkg1'],
      });
    });

    it('only install packages that are not in devDependencies', () => {
      const pkgBeforeInstall = {
        dependencies: { pkg1: '=0.0.1' },
        devDependencies: { pkg2: '=0.0.1' },
      };
      const pkgAfterInstall = {
        dependencies: { pkg1: '=0.0.1', pkg3: '=0.0.1' },
        devDependencies: { pkg2: '=0.0.1' },
      };
      const spawnSyncSpy = jest
        .spyOn(spawn, 'sync')
        .mockImplementationOnce(() => spawnSuccessResult);
      const loadSpy = jest
        .spyOn(PackageHelper, 'load')
        .mockImplementationOnce(() => new PackageHelper(pkgAfterInstall));
      const pkgHelper = new PackageHelper(pkgBeforeInstall);

      const result = pkgHelper.installPackages(['pkg1', 'pkg2', 'pkg3']);

      expect(spawnSyncSpy).toHaveBeenCalledWith(
        'npm',
        ['install', '--ignore-scripts', '--silent', 'pkg3'],
        { encoding: 'utf-8' }
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(result).toEqual({
        requested: ['pkg1', 'pkg2', 'pkg3'],
        installed: ['pkg3'],
        resolved: ['pkg1', 'pkg2'],
      });
    });

    it('does not install anything if everything is already installed', () => {
      const spawnSyncSpy = jest
        .spyOn(spawn, 'sync')
        .mockImplementationOnce(() => spawnSuccessResult);
      const pkgHelper = new PackageHelper({
        dependencies: { pkg1: '=0.0.1' },
        devDependencies: { pkg2: '=0.0.1' },
      });

      const result = pkgHelper.installPackages(['pkg1', 'pkg2']);
      expect(spawnSyncSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        requested: ['pkg1', 'pkg2'],
        installed: [],
        resolved: ['pkg1', 'pkg2'],
      });
    });
  });
});
