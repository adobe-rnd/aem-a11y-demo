# Tabs Block

> A component that organizes content into multiple views within the same space, allowing users to switch between them without leaving the page.

This block provides an accessible and flexible way to present complex information in a compact format.

## Authoring

Create a `(tabs)` block. Each row in the source table represents a tab and its corresponding panel content.

### Structure

| (tabs)                 |
| :--------------------- |
| Tab List (a `<ul>` or `<ol>`) |
| Panel 1 Content        |
| Panel 2 Content        |
| ...                    |

*   **Tab List:** The first cell must contain a list of links. The link's text becomes the tab's title, and the `href` points to the panel's ID (e.g., `#panel-1`).
*   **Panel Content:** Subsequent cells contain the content for each panel. For asynchronous loading, this cell should contain a single link to a `.plain.html` document.

## Block Options / Variants

*   **(Manual):** Add `(manual)` to the block name to require users to activate a tab with `Enter` or `Space` in addition to arrow key navigation. By default, tabs activate automatically on focus.
*   **Default Active Tab**: To make a tab active by default on page load, make its title **bold** or *italic* in the source document. This will be overridden if the URL has a hash that links to a specific tab.

## Features

*   The component automatically adapts to the user's operating system settings for light and dark mode.
*   Converts a standard list of links into a WAI-ARIA compliant tabbed interface.
*   Fully keyboard-navigable, supporting `ArrowLeft`/`ArrowRight`, `Home`, and `End` keys.
*   Supports both automatic activation (default) and manual activation modes.
*   Lazy-loads panel content from other pages for improved performance.
*   Deep-linking support: arriving on the page with a hash that points to a tab panel or content within it will automatically activate the correct tab.
*   Respects user's OS-level high-contrast and reduced motion settings.

## Accessibility Features

*   **ARIA Roles:** Implements the complete ARIA tabs pattern with `role="tablist"`, `role="tab"`, `role="tabpanel"`, and the necessary state attributes (`aria-selected`, `aria-controls`, `aria-labelledby`).
*   **Keyboard Navigation:**
    *   **Default (Automatic Activation):**
        *   `ArrowRight` / `ArrowDown`: Moves focus to and activates the next tab.
        *   `ArrowLeft` / `ArrowUp`: Moves focus to and activates the previous tab.
    *   **Manual Activation (`(manual)` variant):**
        *   `ArrowRight` / `ArrowDown`: Moves focus to the next tab without activating it.
        *   `ArrowLeft` / `ArrowUp`: Moves focus to the previous tab without activating it.
        *   `Enter` / `Space`: Activates the currently focused tab.
    *   **Common Controls (Both Modes):**
        *   `Tab`: Moves focus from a tab into the active panel. If in the panel, moves focus out of the component.
        *   `Shift+Tab`: Moves focus from a panel back to its controlling tab.
        *   `Home` / `End`: Moves focus to the first and last tabs, respectively.
*   **WCAG Conformance:** Designed to meet key criteria including `1.3.1 Info and Relationships`, `1.4.10 Reflow`, `2.1.1 Keyboard`, `2.4.7 Focus Visible`, and `4.1.2 Name, Role, Value`.

## For Developers

*   **File Structure:**
    *   `blocks/tabs/tabs.js`
    *   `blocks/tabs/tabs.css`
*   **CSS Custom Properties:**
    *   `--tab-border-color`: The color of borders.
    *   `--tab-border-color-active`: The color of the active tab's indicator.
    *   `--tab-background-hover`: The background color on hover.
    *   `--tab-focus-outline-color`: The color of the focus outline.
