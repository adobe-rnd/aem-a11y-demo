# Breadcrumb Block

> A navigational aid that shows the user's location within the site's hierarchy, improving orientation and findability.

An accessible breadcrumb trail helps users understand where they are and provides a quick way to navigate to parent pages.

## Authoring

To create a breadcrumb, make a `(breadcrumb)` block and add a single unordered (`<ul>`) or ordered (`<ol>`) list of links inside it. The last item in the list should be the current page and should ideally not be a link.

| (breadcrumb)                        |
| :---------------------------------- |
| `<ul>` or `<ol>` with list items. |

**Example:**
```html
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="/section/">Section</a></li>
  <li>Current Page</li>
</ul>
```

## Features

*   Automatically converts the source list into a structured navigation landmark.
*   Injects visual separators that are hidden from assistive technology.
*   Correctly identifies the current page by marking it with `aria-current="page"`, even if it's authored as a link to the current page.
*   The last item in the list is automatically identified as the current page with `aria-current="page"`.
*   Separators are added via CSS and hidden from assistive technologies.
*   The component automatically adapts to the user's operating system settings for light and dark mode.

## Accessibility Features

*   **Structure:** Wraps the component in a `<nav>` landmark with `aria-label="breadcrumb"` for easy identification by screen readers. The list of links is converted to an `<ol>` to programmatically convey the sequential nature of the path.
*   **Current Page Identification:** The last item in the list is always marked with `aria-current="page"` to clearly indicate the user's current location.
*   **Keyboard Navigation:** Follows standard link-based navigation (`Tab` to move between links, `Enter` to activate).
*   **WCAG Conformance:** Designed to meet key criteria including `1.3.1 Info and Relationships`, `1.3.2 Meaningful Sequence`, `1.4.10 Reflow`, and `2.4.7 Focus Visible`.

## For Developers

*   **File Structure:**
    *   `blocks/breadcrumb/breadcrumb.js`
    *   `blocks/breadcrumb/breadcrumb.css` 