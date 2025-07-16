/* global scheduler */

/**
 * Handles roving tabindex for keyboard navigation on a list of items.
 * @param {KeyboardEvent} e - The keyboard event.
 * @param {HTMLElement[]} items - The items to navigate through.
 * @param {String} [direction='horizontal'] - The navigation direction ('horizontal' or 'vertical').
 * @returns {HTMLElement|null} The new item that should be focused, or null.
 */
// eslint-disable-next-line import/prefer-default-export
export function getItemForKeyEvent(e, items, direction = 'horizontal') {
  const currentItem = e.target;
  const itemIndex = items.indexOf(currentItem);
  let newItem = null;

  const isVertical = direction === 'vertical';
  const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
  const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

  if (e.key === nextKey) {
    newItem = items[(itemIndex + 1) % items.length];
  } else if (e.key === prevKey) {
    newItem = items[(itemIndex - 1 + items.length) % items.length];
  } else if (e.key === 'Home') {
    e.preventDefault();
    [newItem] = items;
  } else if (e.key === 'End') {
    e.preventDefault();
    newItem = items[items.length - 1];
  }

  if (newItem) {
    currentItem.setAttribute('tabindex', '-1');
    newItem.setAttribute('tabindex', '0');
    newItem.focus();
  }

  return newItem;
}

/**
 * Generates a random ID.
 * @returns {string} A random ID.
 */
export function getRandomId(scope = 'a11y') {
  return `${scope}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Replaces a placeholder element with an accessible, inlined SVG icon.
 * @param {Element} placeholder The placeholder element to replace.
 */
export async function decorateInlineIcon(placeholder) {
  const iconName = Array.from(placeholder.classList).find((c) => c.startsWith('icon-')).substring(5);
  if (!iconName) return;

  try {
    const resp = await fetch(`${window.hlx.codeBasePath}/icons/${iconName}.svg`);
    if (!resp.ok) {
      console.warn(`decorateInlineIcon: Could not fetch icon: ${iconName}`);
      return;
    }
    const svgText = await resp.text();
    const svg = new DOMParser().parseFromString(svgText, 'image/svg+xml').querySelector('svg');

    if (svg) {
      // Add accessibility attributes
      const titleText = `${iconName.charAt(0).toUpperCase() + iconName.slice(1)} icon`;
      const titleId = getRandomId('icon-title');
      const title = document.createElement('title');
      title.id = titleId;
      title.textContent = titleText;
      svg.prepend(title);
      svg.setAttribute('aria-labelledby', titleId);
      svg.setAttribute('role', 'img');

      // Copy classes from placeholder
      svg.classList.add(...placeholder.classList);
      placeholder.replaceWith(svg);
    }
  } catch (e) {
    console.warn(`decorateInlineIcon: Error fetching icon: ${iconName}`, e);
  }
}

/**
 * Returns an array of focusable elements within a given element.
 * @param {HTMLElement} element - The element to search for focusable elements.
 * @returns {HTMLElement[]} An array of focusable elements.
 */
export function getFocusableElements(element) {
  if (!element) {
    return [];
  }
  return Array.from(element.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])'));
}

/**
 * Creates and injects skip links for major page landmarks.
 * This is an essential accessibility feature for keyboard-only and screen reader users.
 * @param {Array<Object>} links - An array of link objects, each with a `href` selector and `text`.
 * @param {Document|Element} [scope=document] - The scope within which to find the target elements.
 */
export function createSkipLinks(links, scope = document.body) {
  if (scope.querySelector('.skip-links')) {
    return;
  }

  const container = document.createElement('div');
  container.className = 'skip-links';

  links.forEach((link) => {
    // The href should be a selector for the target element
    const target = scope.querySelector(link.href);
    if (target) {
      // Ensure the target can be programmatically focused.
      // A tabindex of -1 allows for focus via script but not via keyboard tabbing.
      if (!target.hasAttribute('tabindex')) {
        target.tabIndex = -1;
      }

      // Ensure the target has an ID to be linked to.
      if (!target.id) {
        // Create a simple, predictable ID from the selector if one doesn't exist.
        target.id = link.href.replace(/[#.]/g, '');
      }

      const skipLink = document.createElement('a');
      skipLink.className = 'skip-link';
      skipLink.href = `#${target.id}`;
      skipLink.textContent = link.text;

      // When the link is clicked, it moves focus to the target element.
      // The default link behavior handles the view jump.
      skipLink.addEventListener('click', () => {
        target.focus();
      });

      container.append(skipLink);
    }
  });

  if (container.childElementCount > 0) {
    scope.prepend(container);
  }
}

/**
 * Yields to the main thread, allowing the browser to process other tasks.
 * This uses the modern `scheduler.yield` API if available, otherwise falls back
 * to a 0ms timeout.
 * @return {Promise}
 */
export function yieldToMain() {
  if (typeof scheduler?.yield === 'function') {
    return scheduler.yield();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
