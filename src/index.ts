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

import meow from 'meow';
import { init } from './app.js';

const cli = meow(
  `
	Usage
	  $ @wywyjp/wyside init [options]

	Options
	  --help        Prints this help message
    --title, -t   Project title
    --yes, -y     Assume yes for every prompt
    --no, -n      Assume no for every prompt
    --script-dev  Script ID for dev environment
    --script-prod Script ID for production environment

    Examples
    $ @wywyjp/wyside init -y
    $ @wywyjp/wyside init --title "Cool Title"
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

/**
 * Main entry point to coordinate execution based on verb.
 *
 * @param {string} verb
 */
export async function run(verb: string) {
  try {
    if (verb === 'init') {
      await init(cli.flags);
    }
  } catch (err) {
    const error = err as Error;
    console.log(error.message);
  }
}

run(cli.input[0]);
