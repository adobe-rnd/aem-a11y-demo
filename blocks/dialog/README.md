# Dialog Block

The Dialog block provides a modal or non-modal overlay window that can display important information or actions without navigating the user away from the current page. It is highly configurable and built with accessibility and performance at its core.

![Dialog Variants](https://i.imgur.com/example.png) <!-- placeholder image -->

## Features

*   **Modal & Non-Modal:** Can be configured to operate as a modal dialog (trapping focus) or a non-modal one.
*   **Multiple Variants:** Ships with pre-configured styles for `info`, `success`, `warning`, and `error` variants, each with a corresponding icon and color scheme.
*   **Rich Content:** Can contain any AEM content, including text, images, and buttons.
*   **Deep Linking:** A specific dialog can be opened on page load by linking directly to its ID (e.g., `page.html#my-dialog`).
*   **Keyboard Accessible:** Full keyboard navigation, including focus trapping for modals and closing with the `Escape` key.
*   **User-Adaptive:** Adapts to user preferences like dark mode, high-contrast mode, and reduced motion.

## Authoring Guide

To use the Dialog block, create a new block and name it `Dialog`. The block can be configured using classes and is structured with several rows:

1.  **Identifier (Optional):** A single row containing the unique ID for the dialog. This ID is used for deep linking. If omitted, an ID will be generated from the title.
2.  **Title:** A row containing the dialog's title, typically an `H2` or `H3`. This is used as the `aria-labelledby` attribute.
3.  **Content:** A row containing the main content of the dialog. This is used as the `aria-describedby` attribute.
4.  **Footer (Optional):** A row containing buttons.
    *   **Primary Button:** Wrap the button text in `<strong>`.
    *   **Secondary Button:** Wrap the button text in `<em>`.

### Block Classes

*   `.modal`: Creates a modal dialog that traps focus.
*   `.info`, `.success`, `.warning`, `.error`: Applies the corresponding visual variant to the dialog.

### Example

| Dialog (modal, info) | |
| --- | --- |
| `my-info-dialog` | (Identifier) |
| `<h2>Important Information</h2>` | (Title) |
| `<p>This is some important information you should read.</p>` | (Content) |
| `<em>Cancel</em><br><strong>Confirm</strong>` | (Footer) |

## Accessibility & Performance Notes

### Accessibility

The Dialog block is designed to be fully compliant with WCAG 2.2 AA standards.

*   **Role & State:** Uses the native `<dialog>` element, which has the implicit `role="dialog"`.
*   **Focus Management:** For modal dialogs, focus is trapped within the dialog, preventing users from accidentally interacting with the underlying page. When the dialog is closed, focus is returned to the element that originally opened it.
*   **Keyboard Navigation:** Fully operable via keyboard. The `Escape` key closes the dialog.
*   **Accessible Naming:** The dialog's accessible name is derived from its title (`aria-labelledby`), and its description is taken from the content area (`aria-describedby`).
*   **Contrast & Target Size:** All variants have been tested to ensure they meet color contrast and minimum target size requirements.
*   **Testing:** A comprehensive per-criterion test suite for the Dialog block can be found in `tests/blocks/dialog.wcag.test.js`.

### Performance

*   **Lazy Initialization:** The dialog's event listeners are initialized only once on the page, regardless of how many dialogs are present.
*   **Efficient DOM Manipulation:** The decoration process is optimized to minimize reflows and ensure a smooth user experience. 