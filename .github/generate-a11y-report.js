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

  // Handle "--key value" format
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
 * Formats a list of violations into a detailed markdown list.
 * @param {Array} violations The violations to format.
 * @return {String} The markdown list.
 */
function formatViolationsList(violations) {
  if (!violations || violations.length === 0) {
    return 'None.\n';
  }

  let list = '';
  violations.forEach((violation) => {
    list += `- **${violation.impact.toUpperCase()}**: ${violation.help} ([details](${violation.helpUrl}))\n`;
    violation.nodes.forEach((node) => {
      const failureSummary = node.failureSummary.replace(/\\n/g, ' ').replace(/ +/g, ' ').trim();
      list += `  - ${failureSummary}\n`;
      list += `    - ` + '`' + `${node.html}` + '`\n';
    });
  });
  return list;
}

/**
 * Calculates a score out of 100 based on Axe violations.
 * @param {Array} violations - An array of Axe violation objects.
 * @return {Number} The calculated score.
 */
function calculateAxeScore(violations = []) {
  const penalties = {
    critical: 15,
    serious: 8,
    moderate: 3,
    minor: 1,
  };

  const totalPenalty = violations.reduce((acc, v) => acc + (penalties[v.impact] || 0), 0);
  return Math.max(0, 100 - totalPenalty);
}

/**
 * Main function to generate the accessibility summary report.
 * @param {String} reportsDir Directory containing the report files.
 * @param {String} outputFile Path to write the final summary markdown file.
 */
function main(reportsDir, outputFile) {
  if (!reportsDir || !outputFile) {
    console.error('Error: --reports-dir and --output-file arguments are required.');
    process.exit(1);
  }

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

  let summaryTable = '| URL | Accessibility Score | New Issues | Fixed Issues |\\n';
  summaryTable += '| --- | --- | --- | --- |\\n';
  let detailsSection = '';
  let hasRegressions = false;
  let hasNewIssues = false;

  for (const slug in reportsBySlug) {
    const pageReports = reportsBySlug[slug];
    const candidateAxe = pageReports.candidate?.axe;
    const candidateLhr = pageReports.candidate?.lhr;
    
    // We need at least an Axe report to proceed
    if (!candidateAxe) continue;

    const url = candidateLhr?.finalUrl || candidateAxe[0]?.url || slug;
    const axeViolations = (candidateAxe[0]?.violations) || [];
    const axeScore = calculateAxeScore(axeViolations);
    const lhScore = candidateLhr ? Math.round((candidateLhr.categories.accessibility.score || 0) * 100) : null;
    
    const baselineAxe = pageReports.baseline?.axe;
    const baselineLhr = pageReports.baseline?.lhr;
    const hasBaseline = !!baselineAxe;

    let scoreCell;
    
    if (hasBaseline) {
        const baselineAxeViolations = (baselineAxe[0]?.violations) || [];
        const baselineAxeScore = calculateAxeScore(baselineAxeViolations);
        const baselineLhScore = baselineLhr ? Math.round((baselineLhr.categories.accessibility.score || 0) * 100) : null;

        const candidateCombinedScore = lhScore !== null ? Math.round(axeScore * 0.6 + lhScore * 0.4) : axeScore;
        const baselineCombinedScore = baselineLhScore !== null ? Math.round(baselineAxeScore * 0.6 + baselineLhScore * 0.4) : baselineAxeScore;
        
        const scoreDiff = candidateCombinedScore - baselineCombinedScore;
        scoreCell = `${candidateCombinedScore}/100 (${getScoreChangeEmoji(scoreDiff)} ${scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff})`;
    } else {
        const combinedScore = lhScore !== null ? Math.round(axeScore * 0.6 + lhScore * 0.4) : axeScore;
        scoreCell = `${combinedScore}/100`;
    }

    let newIssuesCell = hasBaseline ? '0' : 'N/A';
    let fixedIssuesCell = hasBaseline ? '0' : 'N/A';
    
    let detailForUrl = '';

    if (hasBaseline) {
      const lhBaselineScore = Math.round((baselineLhReport.categories.accessibility.score || 0) * 100);
      const lhScoreDiff = lhScore - lhBaselineScore;
      if (lhScoreDiff < 0) hasRegressions = true;
      scoreCell = `${lhScore}/100 (${getScoreChangeEmoji(lhScoreDiff)} ${lhScoreDiff > 0 ? `+${lhScoreDiff}` : lhScoreDiff})`;

      const baselineAxeViolations = (baselineAxe[0]?.violations) || [];
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
    
    const { pathname } = new URL(url);
    summaryTable += `| [${pathname}](${url}) | ${scoreCell} | ${newIssuesCell} | ${fixedIssuesCell} |\n`;
  }

  const runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  let finalReport = `## ♿ Accessibility Summary\\n\\n${summaryTable}\\n`;

  if (hasNewIssues) {
    finalReport += `<hr>\\n\\n### Detailed Breakdown\\n\\n${detailsSection}\\n\\n`;
  } else if (hasBaseline) {
    finalReport += `\\nNo new issues were introduced. Great job! 👍\\n\\n`;
  }

  finalReport += `__*Full reports are available as [build artifacts](${runUrl}).*__`;
  
  fs.writeFileSync(outputFile, finalReport, 'utf-8');
  console.log(`Accessibility summary report generated at ${outputFile}`);

  if (hasRegressions) {
    console.error('Accessibility regressions detected. Failing the check.');
    process.exit(1);
  }
}

const args = parseArgs();
main(args['reports-dir'], args['output-file']);
