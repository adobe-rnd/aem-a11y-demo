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
 * Main function to generate the accessibility summary report.
 * @param {String} reportsDir Directory containing the report files.
 * @param {String} outputFile Path to write the final summary markdown file.
 */
function main(reportsDir, outputFile) {
  if (!fs.existsSync(reportsDir)) {
    console.log(`Reports directory not found: ${reportsDir}. Exiting.`);
    return;
  }

  const reportFiles = fs.readdirSync(reportsDir);
  const reportsBySlug = {};

  // Group reports by their slug (e.g., 'tabs', 'contact_us')
  reportFiles.forEach((file) => {
    const [type, kind, ...slugParts] = file.replace('.json', '').split('-');
    const slug = slugParts.join('-');
    if (!reportsBySlug[slug]) reportsBySlug[slug] = {};
    if (!reportsBySlug[slug][kind]) reportsBySlug[slug][kind] = {};
    reportsBySlug[slug][kind][type] = readJsonFile(path.join(reportsDir, file));
  });

  let summaryTable = '| URL | Accessibility Score | New Issues | Fixed Issues |\n';
  summaryTable += '| --- | --- | --- | --- |\n';
  let detailsSection = '';

  for (const slug in reportsBySlug) {
    const pageReports = reportsBySlug[slug];
    const candidateAxe = pageReports.candidate?.axe;
    const candidateLhr = pageReports.candidate?.lhr;
    
    if (!candidateAxe || !candidateLhr) continue;

    const url = candidateLhr.finalUrl;
    const lhScore = Math.round((candidateLhr.categories.accessibility.score || 0) * 100);
    const axeViolations = (candidateAxe[0]?.violations) || [];
    
    const baselineAxe = pageReports.baseline?.axe;
    const baselineLhr = pageReports.baseline?.lhr;
    const hasBaseline = !!baselineAxe && !!baselineLhr;

    let scoreCell = `${lhScore}/100`;
    let newIssuesCell = hasBaseline ? '0' : 'N/A';
    let fixedIssuesCell = hasBaseline ? '0' : 'N/A';
    
    let detailForUrl = `<details><summary><strong>${url}</strong></summary>\n\n`;

    if (hasBaseline) {
      const lhBaselineScore = Math.round((baselineLhr.categories.accessibility.score || 0) * 100);
      const lhScoreDiff = lhScore - lhBaselineScore;
      scoreCell = `${lhScore}/100 (${getScoreChangeEmoji(lhScoreDiff)} ${lhScoreDiff >= 0 ? `+${lhScoreDiff}` : lhScoreDiff})`;

      const baselineAxeViolations = (baselineAxe[0]?.violations) || [];
      const { new: newAxe, fixed: fixedAxe } = diffViolations(baselineAxeViolations, axeViolations);
      
      newIssuesCell = newAxe.length;
      fixedIssuesCell = fixedAxe.length;

      detailForUrl += `#### New Issues Introduced (${newAxe.length})\n${formatViolationsList(newAxe)}\n\n`;
      detailForUrl += `#### Issues Fixed (${fixedAxe.length})\n${formatViolationsList(fixedAxe)}\n\n`;
    } else {
      newIssuesCell = axeViolations.length;
      detailForUrl += `#### All Issues Found (${axeViolations.length})\n${formatViolationsList(axeViolations)}\n\n`;
    }
    
    detailForUrl += `</details>\n`;
    
    const truncatedUrl = url.length > 50 ? `${url.substring(0, 47)}...` : url;
    summaryTable += `| [${truncatedUrl}](${url}) | ${scoreCell} | ${newIssuesCell} | ${fixedIssuesCell} |\n`;
    detailsSection += detailForUrl;
  }

  const runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  let finalReport = `## ♿ Accessibility Summary\n\n${summaryTable}\n<hr>\n\n### Detailed Breakdown\n\n${detailsSection}\n\n---\n*Full reports are available as [build artifacts](${runUrl}).*`;
  
  fs.writeFileSync(outputFile, finalReport, 'utf-8');
  console.log(`Accessibility summary report generated at ${outputFile}`);
}

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace(/^--/, '')] = value;
  return acc;
}, {});

main(args['reports-dir'], args['output-file']); 