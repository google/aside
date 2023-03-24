import * as fs from 'fs-extra';
import spawn from 'cross-spawn';
//import { fs } from 'memfs';
import { PackageHelper } from '../src/package-helper';
import { SpawnSyncReturns } from 'child_process';

jest.mock('fs-extra');

describe('package-helper', () => {
  describe('load', () => {
    const pkgHelper = new PackageHelper();

    it('returns undefined if no package.json found', () => {
      jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => {
        throw { code: 'ENOENT' };
      });

      const res = pkgHelper.load();

      expect(res).toBe(undefined);
    });

    it('returns package.json if found', () => {
      const expected = {
        name: 'project',
      };

      jest.spyOn(fs, 'readJsonSync').mockImplementationOnce(() => {
        return expected;
      });

      const res = pkgHelper.load();

      expect(res).toBe(expected);
    });
  });

  describe('init', () => {
    const pkgHelper = new PackageHelper();

    it('uses default package if no package.json found', async () => {
      jest.spyOn(pkgHelper, 'load').mockReturnValue(undefined);

      const res = await pkgHelper.init('test', async () => {
        return true;
      });

      expect(res).toBe(true);
    });

    it('uses existing package if package.json found', async () => {
      const expected = {
        name: 'project',
      };

      jest.spyOn(pkgHelper, 'load').mockReturnValue(expected);

      const res = await pkgHelper.init('test', async () => {
        return true;
      });

      expect(pkgHelper['packageJson']).toEqual(expected);
      expect(res).toBe(false);
    });
  });

  describe('toValidName', () => {
    const pkgHelper = new PackageHelper();

    it('converts string to valid name', () => {
      const res = pkgHelper.toValidName('Some CoolTitle Here');

      expect(res).toEqual('some-cool-title-here');
    });
  });

  describe('getScripts', () => {
    const pkgHelper = new PackageHelper();

    it('returns empty object if no scripts', () => {
      pkgHelper['packageJson'] = {};

      const scripts = pkgHelper.getScripts();

      expect(scripts).toEqual({});
    });

    it('returns empty object if no scripts', () => {
      const pkg = {
        name: 'test',
        scripts: {
          test: 'some script',
        },
      };

      pkgHelper['packageJson'] = pkg;

      const scripts = pkgHelper.getScripts();

      expect(scripts).toEqual(pkg.scripts);
    });
  });

  describe('getMissingDependencies', () => {
    const pkgHelper = new PackageHelper();

    it('returns target dependencies if no dependencies', () => {
      const pkg = {};
      const targetDependencies = ['pkg1', 'pkg2'];

      pkgHelper['packageJson'] = pkg;

      const res = pkgHelper.getMissingDependencies(targetDependencies);

      expect(res).toEqual(targetDependencies);
    });

    it('returns missing dependencies', () => {
      const pkg = {
        dependencies: {
          pkg1: 'v1',
        },
      };
      const targetDependencies = ['pkg1', 'pkg2'];

      pkgHelper['packageJson'] = pkg;

      const res = pkgHelper.getMissingDependencies(targetDependencies);

      expect(res).toEqual(['pkg2']);
    });
  });

  describe('installDependencies', () => {
    const pkgHelper = new PackageHelper();

    it('installs dependencies', async () => {
      jest
        .spyOn(pkgHelper, 'getMissingDependencies')
        .mockReturnValue(['pkg1', 'pkg2']);

      const spawnSyncSpy = jest
        .spyOn(spawn, 'sync')
        .mockImplementationOnce(() => {
          return {
            stderr: '',
          } as unknown as SpawnSyncReturns<string>;
        });

      const res = await pkgHelper.installDependencies(['pkg1', 'pkg2']);

      expect(spawnSyncSpy).toHaveBeenCalledWith(
        'npm',
        ['install', '--ignore-scripts', '--silent', 'pkg1', 'pkg2'],
        { encoding: 'utf-8' }
      );
      expect(res).toBe(true);
    });
  });

  describe('updateScripts', () => {
    const pkgHelper = new PackageHelper();

    it('does not update scripts if declined', async () => {
      const targetScripts = {
        test: 'run test',
        lint: 'run lint',
      };

      const pkg = {
        scripts: {
          test: 'run test 1',
          lint: 'run lint 1',
        },
      };

      pkgHelper['packageJson'] = pkg;

      const res = await pkgHelper.updateScripts(targetScripts, async () => {
        return false;
      });

      expect(pkgHelper['packageJson']).toEqual(pkg);
      expect(res).toBe(false);
    });

    it('does partial update scripts if declined', async () => {
      const targetScripts = {
        test: 'run test',
        lint: 'run lint',
      };

      const pkg = {
        scripts: {
          test: 'run test 1',
        },
      };

      pkgHelper['packageJson'] = pkg;

      const res = await pkgHelper.updateScripts(targetScripts, async () => {
        return false;
      });

      expect(pkgHelper['packageJson']).toEqual({
        scripts: {
          test: 'run test 1',
          lint: 'run lint',
        },
      });
      expect(res).toBe(true);
    });

    it('update scripts', async () => {
      const targetScripts = {
        test: 'run test',
        lint: 'run lint',
      };

      const pkg = {
        scripts: {
          test: 'run test 1',
          lint: 'run lint 1',
        },
      };

      pkgHelper['packageJson'] = pkg;

      const res = await pkgHelper.updateScripts(targetScripts, async () => {
        return true;
      });

      expect(pkgHelper['packageJson']).toEqual({ scripts: targetScripts });
      expect(res).toBe(true);
    });
  });
});
