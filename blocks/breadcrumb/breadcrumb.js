/**
 * Decorates the breadcrumb block.
 * @param {Element} block The breadcrumb block element.
 */
export default function decorate(block) {
  let list = block.querySelector('ul,ol');
  if (!list) {
    // eslint-disable-next-line no-console
    console.warn('Breadcrumb block: No list (ul or ol) found.');
    return;
  }
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'breadcrumb');

  if (list.tagName === 'UL') {
    const ol = document.createElement('ol');
    ol.append(...list.children);
    list = ol;
  }

  const items = [...list.querySelectorAll('li')];

  // Mark the last item as the current page if it is not a link,
  // or if it is a link to the current page.
  const lastItem = items.length > 0 ? items[items.length - 1] : null;
  const lastLink = lastItem?.querySelector('a');
  if (lastItem && (!lastLink || lastLink.href === window.location.href)) {
    lastItem.setAttribute('aria-current', 'page');
  }

  nav.append(list);
  block.innerHTML = '';
  block.append(nav);
}
