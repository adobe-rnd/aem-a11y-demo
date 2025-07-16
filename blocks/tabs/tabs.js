import {
  getRandomId,
  getFocusableElements,
  getItemForKeyEvent,
  yieldToMain,
} from '../../scripts/a11y-core.js';

const originalPanelLinks = {};

/**
 * Switch between tabs
 * @param {Element} newTab - The tab to activate
 * @param {boolean} [setFocus=true] - Whether to set focus to the new tab
 */
async function switchTab(newTab, setFocus = true) {
  const tablist = newTab.closest('[role="tablist"]');
  const oldTab = tablist.querySelector('[aria-selected="true"]');

  if (oldTab) {
    oldTab.setAttribute('aria-selected', 'false');
    oldTab.setAttribute('tabindex', '-1');
    const oldPanel = document.querySelector(`#${oldTab.getAttribute('aria-controls')}`);
    if (oldPanel) {
      oldPanel.setAttribute('hidden', '');
    }
  }

  newTab.setAttribute('aria-selected', 'true');
  newTab.setAttribute('tabindex', '0');
  const newPanel = document.querySelector(`#${newTab.getAttribute('aria-controls')}`);
  if (newPanel) {
    newPanel.removeAttribute('hidden');
    const hasContent = newPanel.firstElementChild;
    const dataSource = newPanel.dataset.src;
    const isLoaded = newPanel.dataset.loaded === 'true';

    // Only load async content if it hasn't been loaded before
    if (!hasContent && dataSource && !isLoaded) {
      newPanel.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(dataSource);
        if (response.ok) {
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const content = doc.querySelector('main > div');
          if (content) {
            newPanel.innerHTML = '';
            newPanel.append(content);
          }
        } else {
          throw new Error('Network response was not ok.');
        }
      } catch (e) {
        newPanel.innerHTML = '';
        const originalLink = originalPanelLinks[dataSource];
        if (originalLink) {
          newPanel.append(originalLink);
        }
      } finally {
        newPanel.removeAttribute('aria-busy');
        newPanel.removeAttribute('aria-live');
        newPanel.dataset.loaded = 'true'; // Mark as loaded
      }
    }
  }
  if (setFocus) {
    newTab.focus();
  }
}

/**
 * Decorates the tabs block with accessibility and functionality.
 * @param {Element} block - The tabs block element.
 */
/* eslint-disable no-await-in-loop, no-restricted-syntax */
export default async function decorate(block) {
  const tablistContainer = block.querySelector('div');
  const tablist = document.createElement('div');
  tablist.setAttribute('role', 'tablist');
  tablist.classList.add('tabs-list');
  const YIELD_BUDGET_MS = 50;
  let deadline = performance.now() + YIELD_BUDGET_MS;

  // Set a temporary min-height to prevent CLS during decoration
  block.style.minHeight = `${block.offsetHeight}px`;

  let tabLinks = [...tablistContainer.querySelectorAll('a')];
  if (!tabLinks.length) {
    // eslint-disable-next-line no-console
    console.warn('No tab anchor links found, falling back to list item elements, but this is not recommended.');
    tabLinks = [...tablistContainer.querySelectorAll('li')];
  }
  if (!tabLinks.length) {
    // eslint-disable-next-line no-console
    console.warn('No tab anchor links found, falling back to paragraph elements, but this is not recommended.');
    tabLinks = [...tablistContainer.querySelectorAll('p')];
  }

  let defaultTab = null;

  for (const link of tabLinks) {
    const tabId = getRandomId('tab');
    const panelId = link.href ? `${new URL(link.href).hash.substring(1)}` : getRandomId('tabpanel');
    const panel = block.querySelector(`#${panelId}`)?.closest('div')
      || block.closest('.section')?.querySelector(`#${panelId}`)?.closest('div')
      || block.parentElement.closest('div')?.querySelector(`#${panelId}`)?.closest('div')
      || block.children.item(tabLinks.indexOf(link) + 1);

    if (panel) {
      const tab = document.createElement('button');
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `${panelId}-container`);
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');

      // Check for strong/em tag to set default open state
      const emphasisElement = link.querySelector('strong, em');
      if (emphasisElement) {
        defaultTab = tab;
        // "Unwrap" the content of the emphasis tag
        emphasisElement.replaceWith(...emphasisElement.childNodes);
      }

      // Move content from the link to the tab button
      tab.append(...link.childNodes);

      // If there's no text content, the link might be an icon,
      // so we use the aria-label from the link as the tab's accessible name.
      if (!tab.textContent.trim() && link.getAttribute('aria-label')) {
        tab.setAttribute('aria-label', link.getAttribute('aria-label'));
      }

      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !e.shiftKey) {
          const firstFocusable = getFocusableElements(panel)?.[0];
          // If the panel has no focusable elements, let the browser handle Tab.
          if (firstFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      });

      tablist.append(tab);

      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('id', `${panelId}-container`);
      panel.setAttribute('aria-labelledby', tabId);
      panel.setAttribute('hidden', '');

      // Handle Shift+Tab from panel back to tab
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && e.shiftKey) {
          // If focus is on the first focusable element, move focus back to the tab
          if (getFocusableElements(panel)?.[0] === document.activeElement) {
            e.preventDefault();
            tab.focus();
          }
        }
      });

      const panelLink = panel.querySelector(':scope > a, :scope > div > a');
      if (panelLink
        && panel.childElementCount === 1
        && panel.textContent === panelLink.textContent) {
        originalPanelLinks[panelLink.href] = panelLink.cloneNode(true);
        panel.dataset.src = panelLink.href;
        panel.setAttribute('aria-live', 'polite');
        panel.setAttribute('aria-busy', 'false');
        panel.innerHTML = window.placeholders?.loading || 'Loading...';
      }
    }
    if (performance.now() > deadline) {
      await yieldToMain();
      deadline = performance.now() + YIELD_BUDGET_MS;
    }
  }

  tablistContainer.replaceWith(tablist);

  // Decoration is complete, remove the min-height
  block.style.minHeight = '';

  tablist.addEventListener('click', (e) => {
    if (e.target.matches('[role="tab"]')) {
      switchTab(e.target);
    }
  });

  tablist.addEventListener('keydown', (e) => {
    const isManual = e.currentTarget.closest('.tabs.manual');
    const items = [...e.currentTarget.querySelectorAll('[role="tab"]')];
    const newTab = getItemForKeyEvent(e, items, 'horizontal');

    if (newTab && !isManual) {
      switchTab(newTab);
    }

    if (isManual && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      switchTab(e.target);
    }
  });

  let tabToActivate = defaultTab || tablist.querySelector('[role="tab"]');
  const { hash } = window.location;
  if (hash) {
    const hashId = hash.substring(1);
    // Try to find a panel that matches the hash directly (e.g., hash is #panel-one)
    let targetPanel = document.getElementById(`${hashId}-container`);

    // If no panel matches, the hash might be for an element inside a panel
    if (!targetPanel) {
      const targetElement = document.getElementById(hashId);
      if (targetElement) {
        targetPanel = targetElement.closest('[role="tabpanel"]');
      }
    }

    if (targetPanel) {
      const targetTab = tablist.querySelector(`[aria-controls="${targetPanel.id}"]`);
      if (targetTab) {
        tabToActivate = targetTab;
      }
    }
  }

  if (tabToActivate) {
    await switchTab(tabToActivate, false);
  }
}
/* eslint-enable no-await-in-loop, no-restricted-syntax */
