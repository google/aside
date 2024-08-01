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
import path from 'path';

const cwd = process.cwd();
const appFolder = path.join(cwd, 'src/ui/src/app');
const appConfigPath = path.join(appFolder, 'app.config.ts');

let appConfig = fs.readFileSync(appConfigPath).toString();

appConfig = appConfig
  .replaceAll(
    `import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';`,
    `import { provideAnimations } from '@angular/platform-browser/animations';`
  )
  .replaceAll('provideAnimationsAsync()', 'provideAnimations()');

fs.writeFileSync(appConfigPath, appConfig);
