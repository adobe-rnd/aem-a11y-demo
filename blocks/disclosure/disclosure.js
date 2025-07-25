import { getRandomId, yieldToMain } from '../../scripts/a11y-core.js';

/**
 * Creates a <details> element for a disclosure item.
 * @param {Element} headingDiv - The div containing the heading content.
 * @param {Element} panelDiv - The div containing the panel content.
 * @returns {Element} The created <details> element.
 */
function createDisclosureItem(headingDiv, panelDiv) {
  if (!headingDiv || !panelDiv) {
    return null;
  }

  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.id = getRandomId('disclosure');

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
  panelContent.classList.add('disclosure-panel-content');
  panelContent.append(...panelDiv.childNodes);
  details.append(panelContent);

  return details;
}

/* eslint-disable no-await-in-loop, no-restricted-syntax */
export default async function decorate(block) {
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
      const details = createDisclosureItem(headingDiv, panelDiv);
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

      const details = createDisclosureItem(headingDiv, panelDiv);
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
  summaries.forEach((summary) => {
    summary.addEventListener('click', () => {
      // The 'open' attribute is not updated until after the click event, so we use a timeout.
      setTimeout(() => {
        const details = summary.closest('details');
        if (details.open) {
          // eslint-disable-next-line no-restricted-globals
          history.pushState(null, '', `#${summary.id}`);
        } else if (window.location.hash === `#${summary.id}`) {
          // eslint-disable-next-line no-restricted-globals
          history.pushState(null, '', window.location.pathname + window.location.search);
        }
      }, 0);
    });
  });

  block.addEventListener('keydown', (e) => {
    const { key, target } = e;

    // Only handle events on the summaries within this block
    if (target.tagName !== 'SUMMARY' || !block.contains(target)) {
      return;
    }

    if (key === 'Enter' || key === 'Space') {
      e.preventDefault();
      const details = target.closest('details');
      details.open = !details.open;
      // Manually trigger the hash change
      if (details.open) {
        // eslint-disable-next-line no-restricted-globals
        history.pushState(null, '', `#${target.id}`);
      } else if (window.location.hash === `#${target.id}`) {
        // eslint-disable-next-line no-restricted-globals
        history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }
  });

  // Deep linking
  const { hash } = window.location;
  if (hash) {
    const hashId = hash.substring(1);
    const targetSummary = document.getElementById(hashId);
    if (targetSummary && targetSummary.closest('.disclosure') === block) {
      targetSummary.closest('details').open = true;
    }
  }
}
/* eslint-enable no-await-in-loop, no-restricted-syntax */
