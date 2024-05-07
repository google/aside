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
const uiDist = path.join(cwd, 'src/ui/dist/ui/browser');
const files = fs
  .readdirSync(uiDist)
  .filter(f => f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.css'));

for (const filename of files) {
  let newName = filename;
  const oldPath = path.join(uiDist, filename);

  if (path.extname(filename) === '.html') {
    newName = 'ui.html';
    const newPath = path.join(cwd, 'dist', newName);
    // Replace <script> tags with GAS <?!= ?> tags
    const scriptRegex = /<script src="([^"]*).js" type="module"><\/script>/g;
    const cssRegex = /<link rel="stylesheet" href="([^"]*).css".*(?=<\/head>)/g;
    let htmlContent = fs.readFileSync(oldPath).toString();
    htmlContent = htmlContent.replaceAll(
      scriptRegex,
      "<?!= include('$1'); ?>\n"
    );
    htmlContent = htmlContent.replaceAll(
      cssRegex,
      "\n<?!= include('$1'); ?>\n"
    );
    fs.writeFileSync(newPath, htmlContent);
  } else if (path.extname(filename) === '.js') {
    newName = path.format({ ...path.parse(filename), base: '', ext: '.html' });
    const newPath = path.join(cwd, 'dist', newName);
    // Add a <script> tag around the js code
    const jsContent = fs.readFileSync(oldPath).toString();
    fs.writeFileSync(
      newPath,
      `<script type="module">\n${jsContent}\n</script>`
    );
  } else {
    newName = path.format({ ...path.parse(filename), base: '', ext: '.html' });
    const newPath = path.join(cwd, 'dist', newName);
    const cssContent = fs.readFileSync(oldPath).toString();
    fs.writeFileSync(newPath, `<style>\n${cssContent}\n</style>`);
  }
}
