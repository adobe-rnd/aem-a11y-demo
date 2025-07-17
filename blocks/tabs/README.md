# Tabs Block

The Tabs block organizes content into multiple switchable panes, allowing users to view different sections of content within the same space. This is ideal for product features, multi-step processes, or related data sets.

## Features

*   **Manual & Automatic Activation:** Supports both modes of keyboard activation. In automatic mode (default), tabs are activated as soon as they receive focus. In manual mode, the user must press `Enter` or `Space` to activate the focused tab.
*   **Asynchronous Content Loading:** Panel content can be loaded on-demand from other pages. The block shows a loading indicator while the content is being fetched, optimizing initial page load time.
*   **Deep Linking:** A specific tab can be activated on page load by linking directly to its corresponding panel's ID (e.g., `page.html#panel-id`).
*   **Intuitive Authoring:** The default active tab can be set simply by wrapping its heading text in `<strong>` or `<em>`.
*   **Performance-Optimized:** Uses a non-blocking decoration strategy to ensure that even tabs with many items do not impact the main thread.

## Authoring Guide

To use the Tabs block, create a new block and name it `Tabs`. The content is authored as a series of rows.

*   **Tab List:** The first row contains the links that will become the tab buttons.
*   **Tab Panels:** Subsequent rows are the content panels. Each panel should have a unique ID that corresponds to the `href` of a tab link in the first row.

### Options

*   `.manual`: Add this class to the block to enable manual activation mode.
*   **Default Active Tab:** To make a tab active by default, wrap its link text in `<strong>` or `<em>`.

### Example (Asynchronous)

| Tabs |
| --- |
| `<a href="#panel-one">Tab 1</a><br><a href="/path/to/panel-two-content.html#panel-two"><strong>Tab 2</strong></a>` |
| `<div id="panel-one"><p>This is the content for the first panel.</p></div>` |
| <!-- The content for panel-two will be loaded from the specified URL --> |

## Accessibility & Performance Notes

### Accessibility

The Tabs block is designed to follow the ARIA Authoring Practices Guide (APG) for the Tabs pattern and is compliant with WCAG 2.2 AA standards.

*   **ARIA Roles & Properties:** Correctly uses `role="tablist"`, `role="tab"`, and `role="tabpanel"`. It also manages `aria-selected`, `aria-controls`, `aria-labelledby`, and `hidden` attributes to communicate the state to assistive technologies.
*   **Keyboard Navigation:**
    *   `Tab`: Moves focus into and out of the tab list.
    *   `Arrow Keys`: Navigate between tabs in the list.
    *   `Enter`/`Space` (in `.manual` mode): Activates the focused tab.
    *   `Home`/`End`: Move to the first/last tab.
*   **Focus Management:** When a tab is activated, focus is set on the tab button. Users can press `Tab` to move focus into the active panel. `Shift+Tab` from the panel moves focus back to the active tab.
*   **Testing:** A comprehensive per-criterion test suite for the Tabs block can be found in `tests/blocks/tabs.wcag.test.js`.

### Performance

*   **Non-Blocking Decoration:** For blocks with many tabs, the `decorate` function yields to the main thread periodically, preventing Long Animation Frames.
*   **Asynchronous Loading:** By loading panel content only when a tab is selected, the initial page weight and rendering time are significantly reduced. A loading indicator (`aria-busy="true"`) informs users of the loading state.
*   **CLS Prevention:** A `min-height` is calculated and set on the block before decoration begins, preventing layout shift.
