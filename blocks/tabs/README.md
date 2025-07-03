# Tabs Block

The `tabs` block creates a WCAG-compliant tabs interface. It's designed with **progressive enhancement** in mind, meaning it's fully functional and accessible as a simple list of in-page links even if JavaScript is disabled. The entire component is authored using a single table.

## Authoring Guide

The `tabs` block is authored using a table with a single column. Each row in the table corresponds to a specific part of the tabs component.

-   **Row 1**: Defines the tab navigation. This must be a list of links. The text of each link becomes a tab's title, and the link's `href` should point to the ID of the corresponding content panel.
-   **Row 2**: Contains the content for the **first** tab. For the non-JavaScript fallback to work correctly, this row must contain an element (typically a heading) with an `id` that exactly matches the `href` of the first tab link.
-   **Row 3**: Contains the content for the **second** tab, with its own matching `id`.
-   ...and so on for all subsequent tabs.

### Basic Tabs

This is the recommended structure. It provides the best accessibility and gracefully degrades without JavaScript. AEM will automatically generate IDs from heading text. Make sure your link's `href` matches the generated ID (e.g., a heading "Product Features" becomes `id="product-features"`).

**Authoring Structure (in a document):**

| tabs                                    |
|-----------------------------------------|
| - [Product Features](#product-features)<br> - [Customer Reviews](#customer-reviews) |
| ### Product Features<br>This is the content for the first panel. You can add any other content or blocks here. |
| ### Customer Reviews<br>This is the content for the second panel. |

### Asynchronous Tabs

For better performance, panel content can be loaded on-demand when a user selects a tab. To do this, place a single link to a `.plain.html` page in that tab's corresponding content row.

**Authoring Structure:**

| tabs                                |
|-------------------------------------|
| - [Our Mission](#our-mission)<br>- [Contact Us](#contact-us)         |
| ### Our Mission<br> This content is loaded immediately. |
| [/contact.plain.html]               |

### Additional Options

#### Manual Activation

By default, tabs are activated as soon as they receive focus via arrow keys. To require users to press `Enter` or `Space` to activate a tab, add the `(manual)` style to the `tabs` block name.

**Authoring Structure:**

| tabs (manual)                       |
|-------------------------------------|
| ...                                 |
