# Breadcrumb

The breadcrumb block provides a navigational aid that shows the user's location within the site's hierarchy, helping them understand and navigate the site structure.

## Features

*   **Accessible by Design**: Automatically wraps the component in a `<nav>` element with an `aria-label="breadcrumb"` and uses an ordered list (`<ol>`) to convey the hierarchical structure.
*   **Current Page Identification**: The last item in the breadcrumb is automatically identified as the current page with `aria-current="page"`.
*   **Flexible Authoring**: Can be authored as either an unordered (`<ul>`) or ordered (`<ol>`) list in the source document.

## Authoring Guide

To use the breadcrumb block, create a new block in AEM's document-based authoring and choose "Breadcrumb".

The breadcrumb is authored as a simple list (either ordered or unordered). Each list item represents a level in the site's hierarchy.

| Breadcrumb |
|---|
| <ul><li><a href="/us/en/products">Products</a></li><li><a href="/us/en/products/creative-cloud">Creative Cloud</a></li><li>Photoshop</li></ul> |

*   The last item should typically not be a link, as it represents the current page.
*   If the last item is a link that points to the current page, `aria-current="page"` will still be correctly applied.

## Accessibility Implementation

The breadcrumb block is designed to be fully compliant with WCAG 2.2 AA standards.

*   **Landmark Navigation**: The component is wrapped in a `<nav>` landmark with an `aria-label` of "breadcrumb", making it easy for screen reader users to find and understand its purpose.
*   **Ordered Structure**: The list is converted to an `<ol>` to programmatically convey that the items are in a specific, hierarchical order.
*   **Current Page State**: The last item is marked with `aria-current="page"` to clearly indicate the user's current location to assistive technologies.
*   **Separator Handling**: The visual separators (e.g., '>') added via CSS are hidden from screen readers with `aria-hidden="true"` to prevent them from being announced, reducing auditory clutter.

## Theming

The breadcrumb block can be styled by targeting its CSS classes and using the available CSS Custom Properties.

| CSS Custom Property | Description | Default Value |
|---|---|---|
| `--breadcrumb-separator-color` | The color of the separator icon. | `#505050` |
| `--breadcrumb-link-color` | The color for breadcrumb links. | `#1473E6` |
| `--breadcrumb-current-color` | The color for the current page text. | `#505050` | 