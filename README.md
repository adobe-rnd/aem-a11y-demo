# AEM Accessible Blocks Library

> A collection of production-ready, accessible, and high-performance AEM blocks for Franklin projects.

This project serves as a demonstration and a source of truth for building AEM blocks that are not only feature-rich but also conform to the highest standards of web accessibility and performance.

## Core Principles

We design and build our components based on these foundational principles:

*   **Accessibility First**: Every component is built to meet or exceed WCAG 2.2 AA guidelines, with many also conforming to AAA standards where practical.
    *   **Pragmatic Semantics**: We use native HTML elements like `<details>` and `<summary>` where possible for maximum robustness, and fall back to appropriate ARIA patterns for more complex components like tabs and dialogs.
    *   **User-Adaptive:** Components respect and adapt to the user's OS-level preferences, such as `prefers-reduced-motion` and `forced-colors` for Windows High Contrast Mode.
    *   **Auditable:** We provide a comprehensive, per-criterion WCAG 2.2 test suite for each block to validate its conformance and document our approach.
*   **Performance by Default**: Components are optimized for Core Web Vitals.
    *   **Non-Blocking Decoration**: Components with potentially many items (e.g., Accordion, Tabs) use a `yieldToMain` strategy to decorate themselves without blocking the main thread, ensuring a responsive user experience.
    *   **CLS Prevention**: We prevent Cumulative Layout Shift during initialization by calculating and setting a `min-height` on the block.
    *   **Asynchronous Content**: The Tabs component supports on-demand loading of panel content from other pages, deferring network requests until they are needed.
*   **Intuitive Authoring**: Blocks are designed to be easily and intuitively authored in AEM's document-based authoring environment. We support common conventions like using `<em>` or `<strong>` to mark the default-open accordion or tab.
*   **Developer Friendly**: Code is modern, clean, and well-documented to encourage collaboration and extension.
    *   **Themeable:** Components are easily configured and styled using CSS Custom Properties, allowing for flexible integration into any design system.
    *   **Deep Linking:** All components support deep linking via the URL hash, allowing users to navigate directly to a specific tab, accordion panel, or open a dialog on page load.

## Available Components

Below is the list of currently available, production-ready blocks. Each component includes detailed documentation on its features, authoring, and accessibility implementation.

| Component | Description | Documentation |
| :--- | :--- | :--- |
| **Accordion** | A component that allows users to show and hide sections of related content. | [View README](./blocks/accordion/README.md) |
| **Breadcrumb** | A navigational aid that shows the user's location within the site's hierarchy. | [View README](./blocks/breadcrumb/README.md) |
| **Dialog** | A modal or non-modal window that appears over the main page content. Supports multiple variants (info, success, etc.). | [View README](./blocks/dialog/README.md) |
| **Tabs** | A component that organizes content into multiple views within the same space. Supports manual/automatic activation and asynchronous loading. | [View README](./blocks/tabs/README.md) |

## Getting Started

To use a component from this library in your own Franklin project:

1.  Copy the component's folder from `blocks/` into your project's `blocks/` directory.
2.  Ensure you have the necessary dependencies and helper files if any are noted in the component's `README.md`.
3.  Follow the authoring guide in the component's `README.md` to add it to your pages.

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
