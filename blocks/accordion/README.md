# Accordion Block

> A vertically stacked set of interactive headings that each contain a title, content, and an associated collapsible panel, built upon the native `<details>` and `<summary>` elements.

Accordions are a common way to organize and condense long-form content, allowing users to scan topics and expand only the sections they are interested in. This implementation uses semantic HTML for a robust and accessible foundation.

The accordion block creates a vertically collapsing set of panels. It can be authored in two ways, which are detected automatically:

1.  **Stacked Layout:** A single-column table where heading and content panels alternate on new rows.
2.  **Two-Column Layout:** A two-column table where the first column is the heading and the second is the content.

### Authoring

To author an accordion, create a block with the name `accordion`.

**Stacked Layout Example:**

| accordion          |
|--------------------|
| Heading for Item 1 |
| Content for Panel 1|
| Heading for Item 2 |
| Content for Panel 2|
| ...                |

**Two-Column Layout Example:**

| accordion          |                    |
|--------------------|--------------------|
| Heading for Item 1 | Content for Panel 1|
| Heading for Item 2 | Content for Panel 2|
| ...                | ...                |

*   For accessibility, the heading cell should contain a proper heading element (e.g., `<h3>`, `<h4>`) whose level fits the page's document outline.

### Options / Variants

*   **Multi-select:** Add the `multi-select` class to the block to allow multiple accordion items to be open simultaneously.
*   **Default Open:** To make an accordion item open by default, make its heading text **bold** or *italic* in the source document.

### Features
*   The component automatically adapts to the user's operating system settings for light and dark mode.
*   Built with semantic `<details>` and `<summary>` elements for native browser accessibility and functionality.
*   Fully keyboard-navigable, enhancing the native behavior with Arrow Key, Home, and End support.
*   Supports both single-select (default) and multi-select modes.
*   Adapts to user's OS-level high-contrast and reduced motion settings.
*   Deep-linking support: arriving on the page with a hash that matches a heading ID will automatically expand that section.

### Deep Linking
The accordion supports deep linking. If the URL hash (`#`) matches the ID of a heading within an accordion, that item will automatically be opened on page load.
