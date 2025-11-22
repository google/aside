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
import { configForSvelte } from '../src/config';

describe('configForSvelte', () => {
  it('should have fs-extra for deploy-ui.mjs', () => {
    // Check if any dependency string starts with "fs-extra"
    const hasFsExtra = configForSvelte.dependencies.some(dep =>
      dep.startsWith('fs-extra')
    );
    expect(hasFsExtra).toBe(true);
  });

  it('should have correct scripts', () => {
    expect(configForSvelte.scripts['serve-ui']).toBe(
      'cd src/ui && npm run dev'
    );

    expect(configForSvelte.scripts['deploy-ui']).toBe(
      'node deploy-ui.mjs src/ui/dist'
    );

    expect(configForSvelte.scripts['preinstall']).toBe('node setup-svelte.mjs');
  });

  it('should have deploy-ui.mjs in filesCopy', () => {
    expect(configForSvelte.filesCopy['deploy-ui.mjs']).toBe('deploy-ui.mjs');

    expect(configForSvelte.filesCopy['setup-svelte.mjs']).toBe(
      'setup-svelte.mjs'
    );
  });
});
