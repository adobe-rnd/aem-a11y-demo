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
    const oldPanel = document.querySelector(`#${oldTab.getAttribute('aria-controls')}`);
    if (oldPanel) {
      oldPanel.setAttribute('hidden', '');
    }
  }

  newTab.setAttribute('aria-selected', 'true');
  const newPanel = document.querySelector(`#${newTab.getAttribute('aria-controls')}`);
  if (newPanel) {
    newPanel.removeAttribute('hidden');
    const hasContent = newPanel.firstElementChild;
    const dataSource = newPanel.dataset.src;
    if (!hasContent && dataSource) {
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
        })
        .catch(() => {
          newPanel.innerHTML = '';
          const originalLink = originalPanelLinks[dataSource];
          if (originalLink) {
            newPanel.append(originalLink);
          } else {
            newPanel.textContent = 'Error loading content.';
          }
          newPanel.removeAttribute('aria-busy');
        });
    }
  }
  newTab.focus();
}

/**
 * Handles keyboard navigation for tabs
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyboardNavigation(e) {
  const tabList = e.currentTarget;
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const currentTab = e.target;
  const isManual = tabList.closest('.tabs.manual');
  let tabIndex = tabs.indexOf(currentTab);

  const activateTab = (tab) => {
    if (isManual) {
      tab.focus();
    } else {
      switchTab(tab);
    }
  };

  if (e.key === 'ArrowRight') {
    tabIndex = (tabIndex + 1) % tabs.length;
    activateTab(tabs[tabIndex]);
  } else if (e.key === 'ArrowLeft') {
    tabIndex = (tabIndex - 1 + tabs.length) % tabs.length;
    activateTab(tabs[tabIndex]);
  } else if (e.key === 'Home') {
    e.preventDefault();
    activateTab(tabs[0]);
  } else if (e.key === 'End') {
    e.preventDefault();
    activateTab(tabs[tabs.length - 1]);
  } else if (isManual && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    switchTab(currentTab);
  }
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

  const tabLinks = [...tablistContainer.querySelectorAll('a')];

  tabLinks.forEach((link, i) => {
    const tabId = `tab-${i}`;
    const panelId = link.getAttribute('href').substring(1);
    const panel = document.querySelector(`#${panelId}`);

    if (panel) {
      const tab = document.createElement('button');
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('aria-selected', 'false');
      tab.textContent = link.textContent.trim();
      tablist.append(tab);

      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      panel.setAttribute('hidden', '');

      const panelLink = panel.querySelector('a');
      if (panel.childElementCount === 1 && panelLink) {
        originalPanelLinks[panelLink.href] = panelLink.cloneNode(true);
        panel.dataset.src = panelLink.href;
        panel.setAttribute('aria-live', 'polite');
        panel.innerHTML = 'Loading...';
      }
    }
  });

  tablistContainer.replaceWith(tablist);

  tablist.addEventListener('click', (e) => {
    if (e.target.matches('[role="tab"]')) {
      switchTab(e.target);
    }
  });

  tablist.addEventListener('keydown', handleKeyboardNavigation);

  const firstTab = tablist.querySelector('[role="tab"]');
  if (firstTab) {
    switchTab(firstTab);
  }
}
