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
import * as fs from 'fs-extra';
import { ClaspHelper } from '../src/clasp-helper';

jest.mock('fs-extra');

describe('clasp-helper', () => {
  const claspHelper = new ClaspHelper();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isLoggedIn', () => {
    it('returns not logged in if clasprc does not exist', async () => {
      jest.spyOn(fs, 'exists').mockImplementationOnce(async () => {
        return false;
      });

      const res = await claspHelper['isLoggedIn']();

      expect(res).toBe(false);
    });

    it('returns logged in if clasprc exists', async () => {
      jest.spyOn(fs, 'exists').mockImplementationOnce(async () => {
        return true;
      });

      const res = await claspHelper['isLoggedIn']();

      expect(res).toBe(true);
    });
  });

  describe('login', () => {
    it('does clasp login if not logged in', async () => {
      const spawnSyncSpy = jest.spyOn(spawn, 'sync').mockImplementation();

      jest.spyOn(claspHelper as any, 'isLoggedIn').mockReturnValue(false);

      await claspHelper.login();

      expect(spawnSyncSpy).toHaveBeenCalledWith('npx', ['clasp', 'login'], {
        stdio: 'inherit',
      });
    });

    it('does nothing if already logged in', async () => {
      const spawnSyncSpy = jest.spyOn(spawn, 'sync').mockImplementation();

      jest
        .spyOn(claspHelper as any, 'isLoggedIn')
        .mockImplementationOnce(async () => {
          return true;
        });

      await claspHelper.login();

      expect(spawnSyncSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('isConfigured', () => {
    it('returns false if config files do not exist', async () => {
      jest.spyOn(fs, 'exists').mockImplementation(async () => {
        return false;
      });

      const res = await claspHelper.isConfigured();

      expect(res).toBe(false);
    });

    it('returns true if config files exist', async () => {
      jest.spyOn(fs, 'exists').mockImplementationOnce(async () => {
        return false;
      });
      jest.spyOn(fs, 'exists').mockImplementationOnce(async () => {
        return true;
      });

      const res = await claspHelper.isConfigured();

      expect(res).toBe(true);
    });
  });

  describe('clean', () => {
    it('removes all config files and creates root dir', async () => {
      const fsRmSpy = jest.spyOn(fs, 'rm').mockImplementation();
      const fsMkdirsSpy = jest.spyOn(fs, 'mkdirs').mockImplementation();

      await claspHelper.clean('rootDir');

      expect(fsRmSpy).toHaveBeenCalledWith('rootDir/.clasp.json', {
        force: true,
        recursive: true,
      });
      expect(fsRmSpy).toHaveBeenCalledWith('appsscript.json', {
        force: true,
      });
      expect(fsRmSpy).toHaveBeenCalledWith('.clasp.json', {
        force: true,
      });
      expect(fsRmSpy).toHaveBeenCalledWith('.clasp-dev.json', {
        force: true,
      });
      expect(fsRmSpy).toHaveBeenCalledWith('.clasp-prod.json', {
        force: true,
      });
      expect(fsMkdirsSpy).toHaveBeenCalledWith('rootDir');
    });
  });

  describe('extractSheetsLink', () => {
    it('returns "Not found" if no sheets link', () => {
      const res = claspHelper.extractSheetsLink('');

      expect(res).toEqual('Not found');
    });

    it('extracts sheets link', () => {
      const output = 'Created new document: https://drive.google.com/abc123';

      const res = claspHelper.extractSheetsLink(output);

      expect(res).toEqual('https://drive.google.com/abc123');
    });
  });

  describe('extractScriptLink', () => {
    it('returns "Not found" if no script link', () => {
      const res = claspHelper.extractScriptLink('');

      expect(res).toEqual('Not found');
    });

    it('extracts script link', () => {
      const output = 'Created new script: https://drive.google.com/abc123';

      const res = claspHelper.extractScriptLink(output);

      expect(res).toEqual('https://drive.google.com/abc123');
    });
  });

  describe('arrangeFiles', () => {
    it('arranges files appropriately with no scriptIdProd', async () => {
      const fsMoveSpy = jest.spyOn(fs, 'move').mockImplementation();
      const fsCopyFileSpy = jest.spyOn(fs, 'copyFile').mockImplementation();

      await claspHelper.arrangeFiles('rootDir');

      expect(fsMoveSpy).toHaveBeenCalledWith('.clasp.json', '.clasp-dev.json');

      expect(fsMoveSpy).toHaveBeenCalledWith(
        'rootDir/appsscript.json',
        'appsscript.json'
      );

      expect(fsCopyFileSpy).toHaveBeenCalledWith(
        '.clasp-dev.json',
        '.clasp-prod.json'
      );
    });

    it('arranges files appropriately with scriptIdProd', async () => {
      jest.spyOn(fs, 'move').mockImplementation();
      const writeConfigSpy = jest
        .spyOn(claspHelper, 'writeConfig')
        .mockImplementation();

      await claspHelper.arrangeFiles('rootDir', 'abc123');

      expect(writeConfigSpy).toHaveBeenCalledWith(
        'abc123',
        'rootDir',
        '.clasp-prod.json'
      );
    });
  });

  describe('cloneAndPull', () => {
    it('calls clasp clone and clasp pull', async () => {
      const spawnSyncSpy = jest.spyOn(spawn, 'sync').mockImplementation();
      const cleanSpy = jest.spyOn(claspHelper, 'clean').mockImplementation();
      const writeConfigSpy = jest
        .spyOn(claspHelper, 'writeConfig')
        .mockImplementation();
      const arrangeFilesSpy = jest
        .spyOn(claspHelper, 'arrangeFiles')
        .mockImplementation();

      await claspHelper.cloneAndPull('1', '2', 'rootDir');

      expect(cleanSpy).toHaveBeenCalledWith('rootDir');
      expect(writeConfigSpy).toHaveBeenCalledWith('1', 'rootDir');
      expect(spawnSyncSpy).toHaveBeenCalledWith('npx', ['clasp', 'clone'], {
        stdio: 'inherit',
      });
      expect(spawnSyncSpy).toHaveBeenCalledWith('npx', ['clasp', 'pull'], {
        stdio: 'inherit',
      });
      expect(arrangeFilesSpy).toHaveBeenCalledWith('rootDir', '2');
    });
  });
});
