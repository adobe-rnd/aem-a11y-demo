import { getItemForKeyEvent, yieldToMain } from '../../scripts/a11y-core.js';
import { toClassName } from '../../scripts/aem.js';

function getHeadingLevel(block) {
  const authorHeading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (authorHeading) {
    return parseInt(authorHeading.tagName.substring(1), 10);
  }

  const section = block.closest('.section');
  if (section) {
    const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
      const lastHeading = headings[headings.length - 1];
      const level = parseInt(lastHeading.tagName.substring(1), 10);
      if (level < 6) {
        return level + 1;
      }
    }
  }

  return 3; // Default to h3 if no other headings are found
}

/**
 * Creates a <details> element for an accordion item.
 * @param {Element} headingDiv - The div containing the heading content.
 * @param {Element} panelDiv - The div containing the panel content.
 * @returns {Element} The created <details> element.
 */
function createAccordionItem(headingDiv, panelDiv, isMultiSelect, headingLevel) {
  if (!headingDiv || !panelDiv) {
    return null;
  }

  const elementWithId = headingDiv.querySelector('[id]');
  // Use author-provided ID as a base, or slugify the heading text
  const baseId = elementWithId
    ? elementWithId.id
    : toClassName(headingDiv.textContent.trim());

  // Create new, unique IDs for the button and panel, leaving the original ID untouched
  const buttonId = `${baseId}-button`;
  const panelId = `${baseId}-panel`;

  // Check for strong/em tag to set default open state before manipulating the DOM
  const emphasisElement = headingDiv.querySelector('strong, em');
  const isOpenByDefault = !!emphasisElement;

  if (emphasisElement) {
    // "Unwrap" the content of the emphasis tag
    emphasisElement.replaceWith(...emphasisElement.childNodes);
  }

  const button = document.createElement('button');
  button.id = buttonId;
  button.setAttribute('aria-controls', panelId);
  button.setAttribute('aria-expanded', isOpenByDefault);

  const authorHeading = headingDiv.querySelector('h1, h2, h3, h4, h5, h6');
  if (authorHeading) {
    button.append(...authorHeading.childNodes);
  } else {
    button.append(...headingDiv.childNodes);
  }

  const heading = document.createElement(`h${headingLevel}`);
  heading.classList.add('accordion-heading');
  heading.appendChild(button);

  const panel = document.createElement('div');
  panel.id = panelId;
  panel.classList.add('accordion-panel');
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', button.id);
  panel.hidden = !isOpenByDefault;

  const panelContent = document.createElement('div');
  panelContent.classList.add('accordion-panel-content');
  panelContent.append(...panelDiv.childNodes);
  panel.appendChild(panelContent);

  const item = document.createElement('div');
  item.classList.add('accordion-item');
  item.append(heading, panel);

  button.addEventListener('click', () => {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    if (!isMultiSelect) {
      const allButtons = button.closest('.accordion').querySelectorAll('button[aria-expanded="true"]');
      allButtons.forEach((b) => {
        if (b !== button) {
          b.setAttribute('aria-expanded', 'false');
          const controlledPanel = document.getElementById(b.getAttribute('aria-controls'));
          if (controlledPanel) controlledPanel.hidden = true;
        }
      });
    }
    const newExpandedState = !isExpanded;
    button.setAttribute('aria-expanded', newExpandedState);
    panel.hidden = !newExpandedState;

    if (newExpandedState) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(null, '', `#${button.id}`);
    } else if (window.location.hash === `#${button.id}`) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(null, '', window.location.pathname + window.location.search);
    }
  });

  return item;
}
/* eslint-disable no-await-in-loop, no-restricted-syntax */
export default async function decorate(block) {
  const isMultiSelect = block.classList.contains('multi-select');
  const isTwoColumnLayout = block.querySelector(':scope > div')?.children.length === 2;
  const headingLevel = getHeadingLevel(block);
  const YIELD_BUDGET_MS = 50;

  const itemHeight = block.querySelector(':scope > div')?.offsetHeight || 48;
  const itemCount = block.querySelectorAll(':scope > div').length / (isTwoColumnLayout ? 1 : 2);
  block.style.minHeight = `${itemCount * itemHeight}px`;

  const newContent = document.createDocumentFragment();

  if (isTwoColumnLayout) {
    const rows = [...block.querySelectorAll(':scope > div')];
    let deadline = performance.now() + YIELD_BUDGET_MS;
    for (const row of rows) {
      const headingDiv = row.children[0];
      const panelDiv = row.children[1];
      const item = createAccordionItem(headingDiv, panelDiv, isMultiSelect, headingLevel);
      if (item) newContent.appendChild(item);
      if (performance.now() > deadline) {
        await yieldToMain();
        deadline = performance.now() + YIELD_BUDGET_MS;
      }
    }
  } else {
    const items = [...block.querySelectorAll(':scope > div')];
    let deadline = performance.now() + YIELD_BUDGET_MS;
    for (let i = 0; i < items.length; i += 2) {
      const headingDiv = items[i].firstElementChild;
      const panelDiv = items[i + 1].firstElementChild;
      const item = createAccordionItem(headingDiv, panelDiv, isMultiSelect, headingLevel);
      if (item) newContent.appendChild(item);
      if (performance.now() > deadline) {
        await yieldToMain();
        deadline = performance.now() + YIELD_BUDGET_MS;
      }
    }
  }

  block.innerHTML = '';
  block.append(newContent);
  block.style.minHeight = '';

  const buttons = block.querySelectorAll('.accordion-heading button');

  buttons.forEach((button, i) => {
    button.setAttribute('tabindex', i === 0 ? '0' : '-1');
  });

  block.addEventListener('keydown', (e) => {
    const { key, target } = e;

    if (target.tagName !== 'BUTTON' || !block.contains(target)) {
      return;
    }

    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      e.preventDefault();
      const items = Array.from(buttons);
      getItemForKeyEvent(e, items, 'vertical');
    }

    if (key === 'Enter' || key === 'Space') {
      e.preventDefault();
      target.click();
    }
  });

  const { hash } = window.location;
  if (hash) {
    const hashId = hash.substring(1);
    const targetButton = document.getElementById(hashId);
    if (targetButton && targetButton.closest('.accordion') === block) {
      targetButton.click();
      targetButton.scrollIntoView();
    }
  }
}
/* eslint-enable no-await-in-loop, no-restricted-syntax */
