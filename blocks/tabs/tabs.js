import { getRandomId, getItemForKeyEvent } from '../../scripts/a11y-core.js';

const originalPanelLinks = {};

/**
 * Switch between tabs
 * @param {Element} newTab - The tab to activate
 */
function switchTab(newTab) {
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
      fetch(dataSource)
        .then((response) => {
          if (response.ok) return response.text();
          throw new Error('Network response was not ok.');
        })
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const content = doc.querySelector('main > div');
          if (content) {
            newPanel.innerHTML = '';
            newPanel.append(content);
          }
          newPanel.removeAttribute('aria-busy');
          newPanel.removeAttribute('aria-live');
          newPanel.dataset.loaded = 'true'; // Mark as loaded
        })
        .catch(() => {
          newPanel.innerHTML = '';
          const originalLink = originalPanelLinks[dataSource];
          if (originalLink) {
            newPanel.append(originalLink);
          }
          newPanel.removeAttribute('aria-busy');
          newPanel.removeAttribute('aria-live');
          newPanel.dataset.loaded = 'true'; // Mark as loaded even on error
        });
    }
  }
  newTab.focus();
}

/**
 * Decorates the tabs block with accessibility and functionality.
 * @param {Element} block - The tabs block element.
 */
export default function decorate(block) {
  const tablistContainer = block.querySelector('div');
  const tablist = document.createElement('div');
  tablist.setAttribute('role', 'tablist');
  tablist.classList.add('tabs-list');

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

  tabLinks.forEach((link, i) => {
    const tabId = getRandomId('tab');
    const panelId = link.href ? `${new URL(link.href).hash.substring(1)}` : getRandomId('tabpanel');
    const panel = block.querySelector(`#${panelId}`)?.closest('div')
      || block.closest('.section')?.querySelector(`#${panelId}`)?.closest('div')
      || block.parentElement.closest('div')?.querySelector(`#${panelId}`)?.closest('div')
      || block.children.item(i + 1);

    if (panel) {
      const tab = document.createElement('button');
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `${panelId}-container`);
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
      tab.textContent = link.textContent.trim();
      tablist.append(tab);

      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('id', `${panelId}-container`);
      panel.setAttribute('aria-labelledby', tabId);
      panel.setAttribute('hidden', '');

      const panelLink = panel.querySelector('a');
      if (panel.childElementCount === 1 && panelLink) {
        originalPanelLinks[panelLink.href] = panelLink.cloneNode(true);
        panel.dataset.src = panelLink.href;
        panel.setAttribute('aria-live', 'polite');
        panel.setAttribute('aria-busy', 'false');
        panel.innerHTML = window.placeholders?.loading || 'Loading...';
      }
    }
  });

  tablistContainer.replaceWith(tablist);

  tablist.addEventListener('click', (e) => {
    if (e.target.matches('[role="tab"]')) {
      switchTab(e.target);
    }
  });

  tablist.addEventListener('keydown', (e) => {
    const isManual = e.currentTarget.closest('.tabs.manual');
    const items = [...e.currentTarget.querySelectorAll('[role="tab"]')];
    const newTab = getItemForKeyEvent(e, items);

    if (newTab && !isManual) {
      switchTab(newTab);
    }

    if (isManual && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      switchTab(e.target);
    }
  });

  let tabToActivate = tablist.querySelector('[role="tab"]');
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
    switchTab(tabToActivate);
  }
}
