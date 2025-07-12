# Accordion

The accordion block allows users to show and hide sections of related content, making it easy to present large amounts of information in a compact space.

![Accordion Demo](./README-assets/accordion-demo.gif)

## Features

*   **Semantic & Accessible**: Built with native `<details>` and `<summary>` elements for maximum accessibility and robustness.
*   **Two Layouts**: Can be displayed in a standard stacked layout or a two-column layout.
*   **Two Selection Modes**: Supports both "single-select" (only one panel can be open at a time) and "multi-select" modes.
*   **Full Keyboard Navigation**: Follows the ARIA pattern for accordions, including support for `ArrowDown`, `ArrowUp`, `Home`, and `End` keys.
*   **Deep Linking**: Users can link directly to a specific accordion item, which will be automatically expanded on page load.
*   **Default Open State**: Authors can specify one or more items to be open by default.

## Authoring Guide

To use the accordion block, create a new block in AEM's document-based authoring and choose "Accordion".

### Stacked Layout (Default)

For a standard vertical accordion, create a two-column table. The first column contains the heading for an item, and the second column contains the panel content.

| Accordion | |
|---|---|
| First Question  | Panel 1 Content |
| Second Question | Panel 2 Content |
| Third Question  | Panel 3 Content |

### Two-Column Layout

For a side-by-side layout, add the "(Columns)" style to the block and structure your content in a two-column table.

| Accordion (Columns) | |
|---|---|
| First Question  | Panel 1 Content |
| Second Question | Panel 2 Content |
| Third Question  | Panel 3 Content |

### Multi-Select Mode

To allow multiple panels to be open simultaneously, add the "(Multi-Select)" style to the block.

| Accordion (Multi-Select) | |
|---|---|
| ... | ... |

### Default Open State

To make an accordion item open by default on page load, simply wrap its heading in `<strong>` or `<em>` tags.

| Accordion | |
|---|---|
| `<strong>First Question</strong>` | This panel will be open by default. |
| `<em>Second Question</em>`  | This panel will also be open by default. |
| Third Question | This panel will be closed. |

## Accessibility Implementation

The accordion block is designed to be fully compliant with WCAG 2.2 AA standards.

*   **Semantic HTML**: Uses `<details>` and `<summary>` elements, which have built-in accessibility for state management (open/closed) and keyboard interaction.
*   **Keyboard Navigation**:
    *   `Tab`: Moves focus to the next accordion header.
    *   `Enter` or `Space`: Toggles the open/closed state of the currently focused panel.
    *   `ArrowDown` / `ArrowUp`: Moves focus between accordion headers.
    *   `Home`: Moves focus to the first accordion header.
    *   `End`: Moves focus to the last accordion header.
*   **ARIA Attributes**: No explicit ARIA roles (e.g., `role="button"`) are needed because the native semantics of `<summary>` are sufficient and more robust.

## Theming

The accordion block can be styled by targeting its CSS classes and using the available CSS Custom Properties.

| CSS Custom Property | Description | Default Value |
|---|---|---|
| `--accordion-border-color` | The color of the border between accordion items. | `#ccc` |
| `--accordion-focus-outline-color` | The color of the focus outline on the summary. | `blue` |
