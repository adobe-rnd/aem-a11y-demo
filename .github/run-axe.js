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

import { chromium } from 'playwright';
import { AxeBuilder } from 'axe-playwright';
import fs from 'fs';

/**
 * Parses command line arguments.
 * Supports: --arg value
 * @return {Object} Parsed arguments.
 */
function parseArgs() {
    const args = {};
    const cliArgs = process.argv.slice(2);
    for (let i = 0; i < cliArgs.length; i += 2) {
        const key = cliArgs[i].replace(/^--/, '');
        const value = cliArgs[i + 1];
        args[key] = value;
    }
    return args;
}

/**
 * Runs an Axe audit on a given URL using Playwright.
 * @param {String} url The URL to audit.
 * @param {String} outputFile The file path to save the report to.
 */
async function runAxe(url, outputFile) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        const results = await new AxeBuilder({ page }).analyze();
        fs.writeFileSync(outputFile, JSON.stringify([results], null, 2)); // Wrap in array for consistency
        console.log(`Axe report saved to ${outputFile}`);
        if (results.violations.length > 0) {
            console.warn(`${results.violations.length} accessibility issues detected on ${url}.`);
        }
    } catch (error) {
        console.error(`Error auditing ${url}:`, error);
        // Still write an empty report to not break the chain
        fs.writeFileSync(outputFile, JSON.stringify([{ violations: [] }]), null, 2);
    } finally {
        await browser.close();
    }
}

const args = parseArgs();

if (!args.url || !args.output) {
    console.error('Usage: node run-axe.js --url <URL> --output <FILE>');
    process.exit(1);
}

runAxe(args.url, args.output).catch((err) => {
    console.error('Axe audit script failed catastrophically:', err);
    process.exit(1);
}); 