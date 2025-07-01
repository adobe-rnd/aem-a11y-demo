/**
 * Handles roving tabindex for keyboard navigation on a list of items.
 * @param {KeyboardEvent} e - The keyboard event.
 * @param {HTMLElement[]} items - The items to navigate through.
 * @returns {HTMLElement|null} The new item that should be focused, or null.
 */
// eslint-disable-next-line import/prefer-default-export
export function getItemForKeyEvent(e, items) {
  const currentItem = e.target;
  const itemIndex = items.indexOf(currentItem);
  let newItem = null;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    newItem = items[(itemIndex + 1) % items.length];
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
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
