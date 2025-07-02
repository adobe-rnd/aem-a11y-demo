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
import path from 'path';

const REPORTS_DIR = './reports';
const BASELINE_DIR = path.join(REPORTS_DIR, 'baseline');
const CANDIDATE_DIR = path.join(REPORTS_DIR, 'candidate');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'summary.md');

/**
 * Reads a JSON file safely.
 * @param {String} filePath Path to the JSON file.
 * @return {Object|null} Parsed JSON object or null.
 */
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error reading or parsing ${filePath}:`, e);
  }
  return null;
}

/**
 * Gets a score change emoji.
 * @param {Number} diff The difference in score.
 * @return {String} The emoji.
 */
function getScoreChangeEmoji(diff) {
  if (diff > 0) return '📈';
  if (diff < 0) return '📉';
  return '😐';
}

/**
 * Diffs two arrays of Axe violations.
 * @param {Array} baseline Baseline violations.
 * @param {Array} candidate Candidate violations.
 * @return {{new: Array, fixed: Array}} New and fixed violations.
 */
function diffViolations(baseline = [], candidate = []) {
  const baselineIds = new Set(baseline.map((v) => v.id));
  const candidateIds = new Set(candidate.map((v) => v.id));
  const newViolations = candidate.filter((v) => !baselineIds.has(v.id));
  const fixedViolations = baseline.filter((v) => !candidateIds.has(v.id));
  return { new: newViolations, fixed: fixedViolations };
}

/**
 * Formats a list of violations into a markdown list.
 * @param {Array} violations The violations to format.
 * @return {String} The markdown list.
 */
function formatViolationsList(violations) {
  if (!violations || violations.length === 0) return 'None.\n';
  return violations.map((v) => `- **${v.impact.toUpperCase()}**: ${v.help} ([details](${v.helpUrl}))`).join('\n');
}

/**
 * Finds the single Lighthouse report file in a directory.
 * @param {String} dir The directory to search.
 * @return {String|null} Path to the report file or null.
 */
function findLighthouseReport(dir) {
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir).filter((file) => file.startsWith('lhr-') && file.endsWith('.json'));
    return files.length > 0 ? path.join(dir, files[0]) : null;
}

/**
 * Main function to generate the accessibility summary report.
 */
function main() {
  if (!fs.existsSync(CANDIDATE_DIR)) {
    console.log('No candidate reports found. Exiting.');
    return;
  }

  const baselineAxeReport = readJsonFile(path.join(BASELINE_DIR, 'axe-baseline.json'));
  const baselineLhReport = readJsonFile(findLighthouseReport(BASELINE_DIR));
  const hasBaseline = !!baselineAxeReport && !!baselineLhReport;

  const candidateFiles = fs.readdirSync(CANDIDATE_DIR);
  const reportsBySlug = {};

  candidateFiles.forEach((file) => {
    const slug = file.replace('axe-', '').replace('lhr-', '').replace('.json', '');
    if (!reportsBySlug[slug]) reportsBySlug[slug] = {};
    if (file.startsWith('axe-')) {
      reportsBySlug[slug].axe = readJsonFile(path.join(CANDIDATE_DIR, file));
    } else if (file.startsWith('lhr-')) {
      reportsBySlug[slug].lhr = readJsonFile(path.join(CANDIDATE_DIR, file));
    }
  });

  let summaryTable = '| URL | Accessibility Score | New Issues | Fixed Issues |\\n';
  summaryTable += '| --- | --- | --- | --- |\\n';
  let detailsSection = '';
  let hasRegressions = false;
  let hasNewIssues = false;

  for (const slug in reportsBySlug) {
    const { axe: axeReport, lhr: lhReport } = reportsBySlug[slug];
    if (!axeReport || !lhReport) continue;

    const url = lhReport.finalUrl;
    const lhScore = Math.round((lhReport.categories.accessibility.score || 0) * 100);
    const axeViolations = (axeReport[0]?.violations) || [];

    let scoreCell = `${lhScore}/100`;
    let newIssuesCell = hasBaseline ? '0' : 'N/A';
    let fixedIssuesCell = hasBaseline ? '0' : 'N/A';
    
    let detailForUrl = '';

    if (hasBaseline) {
      const lhBaselineScore = Math.round((baselineLhReport.categories.accessibility.score || 0) * 100);
      const lhScoreDiff = lhScore - lhBaselineScore;
      if (lhScoreDiff < 0) hasRegressions = true;
      scoreCell = `${lhScore}/100 (${getScoreChangeEmoji(lhScoreDiff)} ${lhScoreDiff > 0 ? `+${lhScoreDiff}` : lhScoreDiff})`;

      const baselineAxeViolations = (baselineAxeReport[0]?.violations) || [];
      const { new: newAxe, fixed: fixedAxe } = diffViolations(baselineAxeViolations, axeViolations);
      
      if (newAxe.length > 0) {
        hasRegressions = true;
        hasNewIssues = true;
      }

      newIssuesCell = newAxe.length;
      fixedIssuesCell = fixedAxe.length;

      detailForUrl += `#### New Issues Introduced (${newAxe.length})\\n${formatViolationsList(newAxe)}\\n\\n`;
      detailForUrl += `#### Issues Fixed (${fixedAxe.length})\\n${formatViolationsList(fixedAxe)}\\n\\n`;
    } else {
      if (axeViolations.length > 0) hasNewIssues = true;
      newIssuesCell = axeViolations.length;
      detailForUrl += `#### All Issues Found (${axeViolations.length})\\n${formatViolationsList(axeViolations)}\\n\\n`;
    }
    
    if (detailForUrl.trim() !== '') {
      detailsSection += `<details><summary><strong>${url}</strong></summary>\\n\\n${detailForUrl}</details>\\n`;
    }
    
    summaryTable += `| [${url.substring(8, 48)}...](${url}) | ${scoreCell} | ${newIssuesCell} | ${fixedIssuesCell} |\\n`;
  }

  const runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  let finalReport = `## ♿ Accessibility Summary\\n\\n${summaryTable}\\n`;

  if (hasNewIssues) {
    finalReport += `<hr>\\n\\n### Detailed Breakdown\\n\\n${detailsSection}\\n\\n`;
  } else if (hasBaseline) {
    finalReport += `\\nNo new issues were introduced. Great job! 👍\\n\\n`;
  }

  finalReport += `__*Full reports are available as [build artifacts](${runUrl}).*__`;
  
  fs.writeFileSync(OUTPUT_FILE, finalReport, 'utf-8');
  console.log(`Accessibility summary report generated at ${OUTPUT_FILE}`);

  if (hasRegressions) {
    console.error('Accessibility regressions detected. Failing the check.');
    process.exit(1);
  }
}

main(); 