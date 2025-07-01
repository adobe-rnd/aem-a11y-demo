/**
 * Handles keyboard navigation for accessible components like tabs and accordions.
 * @param {KeyboardEvent} e - The keyboard event.
 * @param {Function} activateItem - The function to call to activate an item.
 */
// eslint-disable-next-line import/prefer-default-export
export function handleKeyboardNavigation(e, activateItem) {
  const items = [...e.currentTarget.querySelectorAll('[role="tab"], [role="button"]')];
  const currentItem = e.target;
  let itemIndex = items.indexOf(currentItem);

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    itemIndex = (itemIndex + 1) % items.length;
    activateItem(items[itemIndex]);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    itemIndex = (itemIndex - 1 + items.length) % items.length;
    activateItem(items[itemIndex]);
  } else if (e.key === 'Home') {
    e.preventDefault();
    activateItem(items[0]);
  } else if (e.key === 'End') {
    e.preventDefault();
    activateItem(items[items.length - 1]);
  }
}

/**
 * Generates a random ID.
 * @returns {string} A random ID.
 */
export function getRandomId(scope = 'a11y') {
  return `${scope}-${Math.random().toString(36).substring(2, 15)}`;
}
