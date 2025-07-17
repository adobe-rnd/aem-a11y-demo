# Accordion Block

The Accordion block allows users to show and hide sections of related content, making it useful for FAQs, product details, or any content that needs to be condensed. It is built with accessibility and performance as top priorities.

## Features

*   **Native & Robust:** Uses the native `<details>` and `<summary>` HTML elements, providing excellent out-of-the-box accessibility and robustness.
*   **Single or Multi-Select:** Can be configured to allow only one panel to be open at a time (classic accordion behavior) or to allow multiple panels to be open simultaneously.
*   **Flexible Layouts:** Supports both a stacked layout (heading on one row, panel on the next) and a two-column layout (heading and panel on the same row). The layout is auto-detected based on the block's structure.
*   **Deep Linking:** A specific accordion panel can be opened on page load by linking directly to the heading's ID (e.g., `page.html#my-heading-id`).
*   **Intuitive Authoring:** The default open panel can be set simply by wrapping the heading text in `<strong>` or `<em>`.
*   **Performance-Optimized:** Uses a non-blocking decoration strategy to ensure that even accordions with many items do not impact the main thread, providing a smooth user experience.

## Authoring Guide

To use the Accordion block, create a new block and name it `Accordion`. The content is authored as a series of rows that represent the headings and panels.

### Layouts

*   **Stacked Layout (Default):** Create pairs of rows. The first row in the pair is the heading, and the second is the panel content.
*   **Two-Column Layout:** Create a single row with two columns. The first column is the heading, and the second is the panel content.

### Options

*   `.multi-select`: Add this class to the block to allow multiple panels to be open at once.
*   **Default Open Panel:** To make a panel open by default, wrap its heading text in `<strong>` or `<em>`.

### Example (Two-Column, Multi-Select)

| Accordion (multi-select) | |
| --- | --- |
| `<h2>Question 1</h2>` | `<p>Answer 1.</p>` |
| `<h2><strong>Question 2</strong></h2>` | `<p>Answer 2. This one will be open by default.</p>` |
| `<h2>Question 3</h2>` | `<p>Answer 3.</p>` |

## Accessibility & Performance Notes

### Accessibility

The Accordion block is designed to be fully compliant with WCAG 2.2 AA standards.

*   **Semantic HTML:** By using `<details>` and `<summary>`, we leverage the browser's native accessibility features for expandable/collapsible content, including correct roles, states (`open`/`closed`), and keyboard interaction.
*   **Keyboard Navigation:** Fully operable via keyboard. Users can navigate between headings with `Tab` (and `Arrow` keys), and toggle panels with `Enter` or `Space`.
*   **Focus Management:** Roving `tabindex` is used on the `<summary>` elements, allowing users to navigate between accordion headings using arrow keys without having to tab through every focusable element on the page.
*   **Reduced Motion:** The component respects the `prefers-reduced-motion` media query, disabling animations for users who have this preference enabled.
*   **Testing:** A comprehensive per-criterion test suite for the Accordion block can be found in `tests/blocks/accordion.wcag.test.js`.

### Performance

*   **Non-Blocking Decoration:** For accordions with many items, the `decorate` function yields to the main thread periodically, preventing Long Animation Frames and keeping the page responsive.
*   **CLS Prevention:** A `min-height` is calculated and set on the block before decoration begins, preventing the page from shifting as the accordion is progressively rendered.
