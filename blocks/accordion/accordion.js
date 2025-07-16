import { getItemForKeyEvent, yieldToMain } from '../../scripts/a11y-core.js';

/**
 * Creates a <details> element for an accordion item.
 * @param {Element} headingDiv - The div containing the heading content.
 * @param {Element} panelDiv - The div containing the panel content.
 * @returns {Element} The created <details> element.
 */
function createAccordionItem(headingDiv, panelDiv) {
  if (!headingDiv || !panelDiv) {
    return null;
  }

  const details = document.createElement('details');
  const summary = document.createElement('summary');

  // Check for strong/em tag to set default open state
  const emphasisElement = headingDiv.querySelector('strong, em');
  if (emphasisElement) {
    details.open = true;
    // "Unwrap" the content of the emphasis tag
    emphasisElement.replaceWith(...emphasisElement.childNodes);
  }

  summary.append(...headingDiv.childNodes);
  details.append(summary);

  const panelContent = document.createElement('div');
  panelContent.classList.add('accordion-panel-content');
  panelContent.append(...panelDiv.childNodes);
  details.append(panelContent);

  return details;
}

/* eslint-disable no-await-in-loop, no-restricted-syntax */
export default async function decorate(block) {
  const isMultiSelect = block.classList.contains('multi-select');
  // Auto-detect layout by checking the number of columns in the first row
  const isTwoColumnLayout = block.querySelector(':scope > div')?.children.length === 2;
  const YIELD_BUDGET_MS = 50;

  // Pre-calculate height to prevent CLS
  const itemHeight = block.querySelector(':scope > div')?.offsetHeight || 48; // Estimate 48px if not available
  const itemCount = block.querySelectorAll(':scope > div').length / (isTwoColumnLayout ? 1 : 2);
  block.style.minHeight = `${itemCount * itemHeight}px`;

  if (isTwoColumnLayout) {
    const rows = [...block.querySelectorAll(':scope > div')];
    let deadline = performance.now() + YIELD_BUDGET_MS;
    for (const row of rows) {
      const headingDiv = row.children[0];
      const panelDiv = row.children[1];
      const details = createAccordionItem(headingDiv, panelDiv);
      if (details) {
        row.replaceWith(details);
      }
      if (performance.now() > deadline) {
        await yieldToMain();
        deadline = performance.now() + YIELD_BUDGET_MS;
      }
    }
  } else {
    // Default stacked layout
    const items = [...block.querySelectorAll(':scope > div')];
    let deadline = performance.now() + YIELD_BUDGET_MS;
    for (let i = 0; i < items.length; i += 2) {
      const headingRow = items[i];
      const panelRow = items[i + 1];
      // In stacked layout, the content is in the first child of the row
      const headingDiv = headingRow.firstElementChild;
      const panelDiv = panelRow.firstElementChild;

      const details = createAccordionItem(headingDiv, panelDiv);
      if (details) {
        headingRow.replaceWith(details);
        panelRow.remove();
      }
      if (performance.now() > deadline) {
        await yieldToMain();
        deadline = performance.now() + YIELD_BUDGET_MS;
      }
    }
  }

  // Clear the min-height after decoration is complete
  block.style.minHeight = '';

  const summaries = block.querySelectorAll('summary');

  // Initialize tabindex for roving focus
  summaries.forEach((summary, i) => {
    summary.setAttribute('tabindex', i === 0 ? '0' : '-1');
  });

  const handleSingleSelection = (clickedSummary) => {
    const details = clickedSummary.closest('details');
    // Toggle the clicked details element
    details.open = !details.open;

    // Close all other details elements
    summaries.forEach((summary) => {
      const otherDetails = summary.closest('details');
      if (otherDetails !== details) {
        otherDetails.open = false;
      }
    });
  };

  summaries.forEach((summary) => {
    summary.addEventListener('click', (e) => {
      // For multi-select, allow the native browser behavior
      if (isMultiSelect) return;
      // For single-select, prevent default and manage state manually
      e.preventDefault();
      handleSingleSelection(e.currentTarget);
    });
  });

  block.addEventListener('keydown', (e) => {
    const { key, target } = e;

    // Only handle events on the summaries within this block
    if (target.tagName !== 'SUMMARY' || !block.contains(target)) {
      return;
    }

    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      e.preventDefault();
      const items = Array.from(summaries);
      getItemForKeyEvent(e, items, 'vertical');
    }

    if (key === 'Enter' || key === 'Space') {
      e.preventDefault();
      if (isMultiSelect) {
        // In multi-select, just toggle the current item
        target.closest('details').open = !target.closest('details').open;
      } else {
        // In single-select, use the dedicated handler
        handleSingleSelection(target);
      }
    }
  });

  // Deep linking
  const { hash } = window.location;
  if (hash) {
    const hashId = hash.substring(1);
    const targetHeading = document.getElementById(hashId);
    if (targetHeading) {
      const targetDetails = targetHeading.closest('details');
      if (targetDetails) {
        targetDetails.open = true;
      }
    }
  }
}
/* eslint-enable no-await-in-loop, no-restricted-syntax */
