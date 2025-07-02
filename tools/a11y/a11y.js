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
/* eslint-disable no-console, import/no-unresolved */

/**
 * Removes all existing highlights from the page.
 */
function clearHighlights() {
  document.querySelectorAll('.a11y-inspector-highlight').forEach((el) => {
    // Remove the highlight class
    el.classList.remove('a11y-inspector-highlight');
    // Remove the tooltip if it exists
    const tooltip = el.querySelector('.a11y-inspector-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  });
}

/**
 * Applies a highlight and a tooltip to an element with an accessibility issue.
 * @param {HTMLElement} element The element to highlight.
 * @param {Object} violation The Axe violation object.
 */
function applyHighlight(element, violation) {
  element.classList.add('a11y-inspector-highlight');
  const tooltip = document.createElement('div');
  tooltip.className = 'a11y-inspector-tooltip';
  tooltip.innerHTML = `
    <strong>${violation.impact.toUpperCase()}:</strong> ${violation.help}
    <a href="${violation.helpUrl}" target="_blank" rel="noopener noreferrer">(Learn more)</a>
  `;
  element.append(tooltip);
}

/**
 * Runs the accessibility audit using axe-core and highlights the issues on the page.
 */
export default async function runAudit() {
  clearHighlights();

  // Dynamically import axe-core to avoid loading it unless the tool is used.
  try {
    const axe = (await import('https://esm.sh/axe-core')).default;
    const results = await axe.run(document, {
      resultTypes: ['violations'],
      // Add any specific rules or configurations here
    });

    if (results.violations.length === 0) {
      console.log('A11y Inspector: No violations found!');
      return;
    }

    console.log(`A11y Inspector: Found ${results.violations.length} violations.`);
    results.violations.forEach((violation) => {
      violation.nodes.forEach((node) => {
        const element = document.querySelector(node.target[0]);
        if (element) {
          applyHighlight(element, violation);
        }
      });
    });
  } catch (e) {
    console.error('A11y Inspector: Failed to run audit.', e);
  }
}
