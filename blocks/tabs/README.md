# Tabs

The tabs block is a component that organizes content into multiple views within the same space, allowing users to switch between them.

![Tabs Demo](./README-assets/tabs-demo.gif)

## Features

*   **Accessible ARIA Patterns**: Implements the `tab`, `tablist`, and `tabpanel` ARIA design pattern for assistive technologies.
*   **Two Activation Modes**: Supports both "Automatic" activation (switching tabs as soon as they receive focus) and "Manual" activation (requiring an `Enter` or `Space` key press).
*   **Asynchronous Content Loading**: Panels can be configured to load their content on demand from another page, improving initial page load performance.
*   **Full Keyboard Navigation**: Follows the ARIA pattern for tabs, including support for `ArrowRight`, `ArrowLeft`, `Home`, and `End` keys.
*   **Deep Linking**: Users can link directly to a specific tab, which will be automatically opened on page load.
*   **Default Open State**: Authors can specify a tab to be open by default.

## Authoring Guide

To use the tabs block, create a block in AEM's document-based authoring and choose "Tabs". The block is authored as a single-column table.

*   **Row 1: Tab List**: The first row must contain a list (`<ul>` or `<ol>`) of links. The text of each link becomes the tab heading, and the link's `href` must be a hash that points to the ID of the corresponding panel `div` (e.g., `#panel-1`).
*   **Subsequent Rows: Panels**: Each subsequent row contains a `div` for a panel. This `div` must have an `id` that matches the hash from the corresponding tab link.

| Tabs |
|---|
| <ul><li><a href="#panel-1">Tab 1</a></li><li><a href="#panel-2">Tab 2</a></li></ul> |
| <div id="panel-1">Content for the first panel.</div> |
| <div id="panel-2">Content for the second panel.</div> |


### Manual Activation

To require users to press `Enter` or `Space` to switch tabs (instead of automatically switching on arrow key navigation), add the "(Manual)" style to the block name in the table header.

### Default Open State

To make a tab open by default on page load, simply wrap its text in the list item in `<strong>` or `<em>` tags.

### Asynchronous Content

To load panel content from another page, the panel's `div` should contain only a single link to the other page. The block will automatically fetch the content from the `main` section of the linked page and replace the link.

| Tabs |
|---|
| ... (tab list) ... |
| <div id="panel-remote"><a href="/path/to/other-page"></a></div> |

## Accessibility Implementation

The tabs block is designed to be fully compliant with WCAG 2.2 AA standards.

*   **ARIA Roles**: Uses `role="tablist"`, `role="tab"`, and `role="tabpanel"` to define the relationship between elements.
*   **State Management**: Uses `aria-selected`, `aria-controls`, and `aria-labelledby` to programmatically link tabs to their panels and indicate the current state.
*   **Keyboard Navigation**:
    *   `Tab`: When focus is on a tab, `Tab` moves focus to the active tab panel. Within a panel, it moves to the next focusable element.
    *   `Shift+Tab`: When focus is on the first element in a panel, `Shift+Tab` moves focus back to the associated tab.
    *   `ArrowRight` / `ArrowLeft`: Moves focus between tabs. In automatic activation mode, this also switches the visible panel.
    *   `Home` / `End`: Moves focus to the first or last tab, respectively.
*   **Async State**: Uses `aria-busy="true"` on panels during asynchronous loading to inform assistive technologies that the content is updating.

## Theming

The tabs block can be styled by targeting its CSS classes and using the available CSS Custom Properties.

| CSS Custom Property | Description | Default Value |
|---|---|---|
| `--tab-border-color` | The color of the border on the tab list. | `#ccc` |
| `--tab-active-border-color` | The color of the border on the active tab. | `blue` |
| `--tab-focus-outline-color` | The color of the focus outline on a tab. | `blue` |
