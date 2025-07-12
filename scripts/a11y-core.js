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
