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

import { loadCSS } from '../../scripts/aem.js';

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
 * Creates or retrieves the notification container element.
 * @return {HTMLElement} The notification container.
 */
function getNotificationContainer() {
  const CONTAINER_ID = 'a11y-inspector-container';
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.style.position = 'fixed';
    container.style.zIndex = '10002';
    container.style.top = '0';
    container.style.left = '0';
    container.style.pointerEvents = 'none';
    document.body.append(container);
  }
  return container;
}

/**
 * Shows a toast notification message.
 * @param {String} message The message to display.
 * @param {Boolean} [isSuccess=true] Determines the style of the toast.
 */
function showToast(message, isSuccess = true) {
  const container = getNotificationContainer();
  const toast = document.createElement('div');
  toast.className = `a11y-inspector-toast ${isSuccess ? 'success' : 'error'}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  container.append(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Animate out and remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 5_000);
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
    <a href="${violation.helpUrl}" target="_blank" rel="noopener noreferrer" style="color: #ADDEFF; pointer-events: auto;">(Learn more)</a>
  `;

  let hideTimeout;

  const updateTooltipPosition = () => {
    if (!tooltip.parentNode) return;
    const rect = element.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight;
    tooltip.style.left = `${rect.left}px`;
    if (rect.bottom + tooltipHeight + 8 > window.innerHeight) {
      tooltip.style.top = `${rect.top - tooltipHeight - 8}px`; // Show above
    } else {
      tooltip.style.top = `${rect.bottom + 8}px`; // Show below
    }
  };

  const onTransitionEnd = () => tooltip.remove();

  const showTooltip = () => {
    clearTimeout(hideTimeout);
    tooltip.removeEventListener('transitionend', onTransitionEnd);
    const container = getNotificationContainer();
    if (!container.contains(tooltip)) {
      container.append(tooltip);
      window.addEventListener('scroll', updateTooltipPosition, true);
    }
    updateTooltipPosition();
    tooltip.style.opacity = '1';
  };

  const hideTooltip = () => {
    window.removeEventListener('scroll', updateTooltipPosition, true);
    tooltip.style.opacity = '0';
    tooltip.addEventListener('transitionend', onTransitionEnd, { once: true });
  };

  const startHideTimer = () => {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideTooltip, 200);
  };

  element.addEventListener('mouseover', showTooltip);
  element.addEventListener('mouseout', startHideTimer);

  tooltip.addEventListener('mouseover', () => {
    clearTimeout(hideTimeout);
  });
  tooltip.addEventListener('mouseout', startHideTimer);
}

/**
 * Runs the accessibility audit using axe-core and highlights the issues on the page.
 */
export default async function runAudit() {
  await loadCSS('/tools/a11y/a11y.css');
  clearHighlights();

  // Dynamically import axe-core to avoid loading it unless the tool is used.
  try {
    const axe = (await import('https://esm.sh/axe-core')).default;

    const options = {
      tags: ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'wcag2aaa', 'best-practice'],
      // Exclude the sidekick element and its shadow DOM from the audit
      // rules: {
      //   // Enable WCAG 2.2 specific rules
      //   'target-size': { enabled: true }, // AAA requirement
      //   'focus-order-semantics': { enabled: true },
      //   // 'consistent-help': { enabled: true },
      // },
    };

    const results = await axe.run(document.body, options);

    results.violations = results.violations.filter((violation) => {
      violation.nodes = violation.nodes.filter((node) => {
        node.target = node.target.filter((target) => target[0] !== 'aem-sidekick');
        return node.target.length > 0;
      });
      return violation.nodes.length > 0;
    });

    const totalViolations = results.violations.reduce((acc, v) => acc + v.nodes.length, 0);

    if (totalViolations === 0) {
      showToast('No accessibility violations found! 🎉');
      return;
    }

    const violationText = totalViolations === 1 ? 'violation' : 'violations';
    showToast(`Found ${totalViolations} ${violationText}. Hover over highlighted elements for details.`, false);

    console.log(`A11y Inspector: Found ${totalViolations} ${violationText}.`);
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
