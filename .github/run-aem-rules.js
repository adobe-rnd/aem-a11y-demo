/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import fs from 'fs';
import { AEM_RULES } from './aem-rules.js';

/**
 * Parses command line arguments.
 * Supports: --arg value, --arg=value, --arg
 * @return {Object} Parsed arguments.
 */
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (value !== undefined) {
        args[key] = value;
      } else {
        args[key] = true;
      }
    }
  });
  process.argv.slice(2).forEach((arg, i, arr) => {
    if (arg.startsWith('--') && args[arg.substring(2)] === true) {
      const next = arr[i + 1];
      if (next && !next.startsWith('--')) {
        args[arg.substring(2)] = next;
      }
    }
  });
  return args;
}

// This is a placeholder for running custom AEM rules.
// In a real implementation, this would likely use Playwright to navigate to the URL,
// inject aem-rules.js, and execute the checks.
async function runAEMRules(url, outputFile) {
  console.log(`Running custom AEM rules on ${url}`);
  const results = {
    url,
    timestamp: new Date().toISOString(),
    violations: AEM_RULES,
  };

  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`Custom AEM rules report saved to ${outputFile}`);
  }

  return results;
}

(async () => {
  const { url, output } = parseArgs();
  if (!url) {
    console.error('URL is required');
    process.exit(1);
  }
  await runAEMRules(url, output);
})(); 