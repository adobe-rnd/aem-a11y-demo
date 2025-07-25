# AEM Accessible Blocks Library

> A collection of production-ready, accessible, and high-performance AEM blocks for Franklin projects.

This project serves as a demonstration and a source of truth for building AEM blocks that are not only feature-rich but also conform to the highest standards of web accessibility and performance.

## Core Principles

We design and build our components based on these foundational principles:

*   **Accessibility First**: Every component is built to meet or exceed WCAG 2.2 AA and AAA guidelines.
    *   **User-Adaptive:** Components respect and adapt to the user's OS-level preferences, such as `prefers-reduced-motion` and `forced-colors` for Windows High Contrast Mode.
    *   **Auditable:** We provide a comprehensive, per-criterion test suite for each block to validate its conformance.
*   **Performance by Default**: Components are optimized for Core Web Vitals. Techniques like asynchronous content loading are used to ensure a fast user experience.
*   **Intuitive Authoring**: Blocks are designed to be easily and intuitively authored in AEM's document-based authoring environment.
*   **Developer Friendly**: Code is modern, clean, and well-documented to encourage collaboration and extension.
    *   **Themeable:** Components are easily configured and styled using CSS Custom Properties, allowing for flexible integration into any design system.
    *   **Programmatic Control:** Beyond automatic decoration, each block exposes a simple API for direct script-based interaction and control.

## Features

### Deep Linking

Components that toggle content visibility, such as the Accordion, Tabs, and Disclosure blocks, automatically update the URL with a hash corresponding to the currently active or open content panel. This allows users to copy and share a link that will navigate directly to a specific section of content, which will be automatically opened when the page loads.

## Foundation Systems

### **Grid System**

A mobile-first, progressive 12-column CSS Grid system designed for layout without breaking accessibility.

- **📐 Progressive Layout**: 1 column (mobile) → 6 columns (tablet) → 12 columns (desktop)
- **♿ Accessibility First**: Maintains source order independence and logical tab flow
- **📱 Mobile First**: All columns full-width on mobile, progressive enhancement on larger screens
- **🎨 User Adaptive**: Respects motion, contrast, and forced color preferences

**Breakpoints**: Mobile (default) → Tablet (768px+) → Desktop (1024px+)

**[📖 View Grid System Documentation](./docs/GRID_SYSTEM.md)**

## Available Components

Below is the list of currently available, production-ready blocks. Each component includes detailed documentation on its features, authoring, and accessibility implementation.

| Component | Description | Documentation |
| :--- | :--- | :--- |
| **Accordion** | A component that allows users to show and hide sections of related content. | [View README](./blocks/accordion/README.md) |
| **Breadcrumb** | A navigational aid that shows the user's location within the site's hierarchy. | [View README](./blocks/breadcrumb/README.md) |
| **Dialog (Modal)** | A window overlaid on the primary window, which requires user interaction. Implements focus trapping. | [View README](./blocks/dialog/README.md) |
| **Disclosure** | A simple widget for showing and hiding a single section of content, using the native `<details>` element. | [View README](./blocks/disclosure/README.md) |
| **Tabs** | A component that organizes content into multiple views within the same space. Supports manual/automatic activation and asynchronous loading. | [View README](./blocks/tabs/README.md) |

## Getting Started

To use a component from this library in your own Franklin project:

1.  Copy the component's folder from `blocks/` into your project's `blocks/` directory.
2.  Ensure you have the necessary dependencies and helper files if any are noted in the component's `README.md`.
3.  Follow the authoring guide in the component's `README.md` to add it to your pages.

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
