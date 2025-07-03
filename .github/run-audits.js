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
import { execSync } from 'child_process';

const urlPairs = JSON.parse(process.env.URL_PAIRS);
const reportDir = './reports/all';

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

function runAudit(url, type, slug) {
  if (!url || !type || !slug) {
    return;
  }
  console.log(`Auditing ${url} (type: ${type}, slug: ${slug})`);
  const axeFile = `${reportDir}/axe-${type}-${slug}.json`;
  const lhrFile = `${reportDir}/lhr-${type}-${slug}.json`;

  try {
    execSync(`node ./.github/run-axe.cjs --url ${url} --output ${axeFile}`, { stdio: 'inherit' });
  } catch (e) {
    console.warn(`Axe audit for ${url} failed to execute.`);
  }

  try {
    execSync(`npx lhci collect --url=${url} --config=./lighthouserc.cjs`, { stdio: 'inherit' });
    const tempLhr = fs.readdirSync('.lighthouseci').find((f) => f.startsWith('lhr-'));
    if (tempLhr) {
      fs.renameSync(`.lighthouseci/${tempLhr}`, lhrFile);
    }
  } catch (e) {
    console.warn(`Lighthouse audit failed for ${url}.`);
  }
}

for (const pair of urlPairs) {
  if (!pair.candidate) continue;
  try {
    const slug = new URL(pair.candidate).pathname.replace(/[^a-zA-Z0-9]/g, '_');
    runAudit(pair.candidate, 'candidate', slug);
    runAudit(pair.baseline, 'baseline', slug);
  } catch (e) {
    console.warn(`Skipping audit for invalid candidate URL: ${pair.candidate}`);
  }
} 