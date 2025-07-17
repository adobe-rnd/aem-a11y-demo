# Breadcrumb Block

The Breadcrumb block provides a navigational aid that shows the user's current location within the site's hierarchy, helping them understand and navigate the site structure.

## Features

*   **Semantic & Accessible:** Uses a `<nav>` element with an `aria-label` to identify it as a breadcrumb trail and `aria-current="page"` to mark the current page, providing a clear and accessible experience for screen reader users.
*   **Flexible Authoring:** Can be authored using either an ordered (`<ol>`) or unordered (`<ul>`) list, which is then automatically converted to the correct semantic structure.
*   **Lightweight & Performant:** A simple component with minimal JavaScript, ensuring it has no impact on page performance.

## Authoring Guide

To use the Breadcrumb block, create a new block and name it `Breadcrumb`. The content is a single list (either `<ul>` or `<ol>`) of links representing the path to the current page.

*   The last item in the list is automatically identified as the current page and will be marked with `aria-current="page"`. It can be plain text or a link.

### Example

| Breadcrumb |
| --- |
| `<ul><li><a href="/">Home</a></li><li><a href="/section/">Section</a></li><li>Current Page</li></ul>` |

## Accessibility & Performance Notes

### Accessibility

The Breadcrumb block is designed to follow the ARIA Authoring Practices Guide (APG) for the Breadcrumbs pattern and is compliant with WCAG 2.2 AA standards.

*   **Semantic Structure:** The list is wrapped in a `<nav>` element with `aria-label="breadcrumb"` to programmatically identify its purpose.
*   **Current Page Identification:** The last item in the list is automatically marked with `aria-current="page"` to clearly indicate to screen reader users which page they are currently on.
*   **Ordered List:** Any `<ul>` provided by the author is converted to an `<ol>` to semantically represent the ordered, hierarchical nature of the breadcrumb trail.
*   **Testing:** A comprehensive per-criterion test suite for the Breadcrumb block can be found in `tests/blocks/breadcrumb.wcag.test.js`.

### Performance

The Breadcrumb block is extremely lightweight. It has a small, synchronous decoration script and minimal CSS, resulting in no measurable impact on Core Web Vitals. 