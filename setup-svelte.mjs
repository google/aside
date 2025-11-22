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

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const uiDir = path.join(cwd, 'src/ui');

// Ensure src directory exists
if (!fs.existsSync(path.join(cwd, 'src'))) {
  fs.mkdirSync(path.join(cwd, 'src'));
}

if (!fs.existsSync(uiDir)) {
  console.log('Creating Svelte app with Vite...');
  // Create the project in src/ui
  execSync('npm create vite@latest src/ui -- --template svelte-ts', {
    stdio: 'inherit',
  });

  console.log('Installing UI dependencies...');
  execSync('cd src/ui && npm install', { stdio: 'inherit' });

  console.log('Setting up Tailwind CSS...');
  // Install Tailwind and peers
  execSync('cd src/ui && npm install -D tailwindcss postcss autoprefixer', {
    stdio: 'inherit',
  });
  // Init Tailwind
  execSync('cd src/ui && npx tailwindcss init -p', { stdio: 'inherit' });

  // Configure tailwind.config.js
  const tailwindConfigPath = path.join(uiDir, 'tailwind.config.js');
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
  fs.writeFileSync(tailwindConfigPath, tailwindConfig);

  // Add directives to CSS
  // Try to find app.css or index.css
  const possibleCssFiles = ['src/app.css', 'src/index.css', 'src/global.css'];
  let cssFile = possibleCssFiles.find(f =>
    fs.existsSync(path.join(uiDir, f))
  );

  // If no CSS file found, create src/app.css and ensure it is imported (complex), 
  // but standard template usually has app.css.
  if (!cssFile) {
    cssFile = 'src/app.css'; // Default fallback
  }

  const cssPath = path.join(uiDir, cssFile);
  const directives = `@tailwind base;
@tailwind components;
@tailwind utilities;

`;
  
  let currentContent = '';
  if (fs.existsSync(cssPath)) {
    currentContent = fs.readFileSync(cssPath, 'utf8');
  }
  
  fs.writeFileSync(cssPath, directives + currentContent);

  console.log('Svelte UI with Tailwind CSS setup complete.');
} else {
  console.log('src/ui already exists, skipping creation.');
}
