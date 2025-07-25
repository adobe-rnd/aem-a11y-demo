# Accordion Block

The Accordion block creates a vertically stacked set of interactive headings that each reveal a section of content. It is a common way to organize and condense content-heavy pages.

This block implements the [WAI-ARIA Accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) to ensure it is accessible to all users.

## Features

- **Deep Linking:** Automatically updates the URL with a hash of the active accordion item's ID, allowing users to share links directly to specific content.
- **Author-Friendly IDs:** Authors can provide a custom `id` attribute to any heading in the source document, which will then be used for the deep link hash. If no ID is provided, a random one is generated.
- **Dynamic Heading Levels:** The block intelligently determines the appropriate heading level (`h2`-`h6`) based on the surrounding content structure, ensuring a correct document outline.
- **Multi-Select:** Can be configured to allow multiple items to be open simultaneously.

## Authoring

Accordions can be authored in two layouts:

1.  **Stacked Layout:** A series of heading/content pairs.
2.  **Columns Layout:** A two-column table where the left column is the heading and the right is the content.

The default open item can be set by making its heading text **Bold** or *Italic*.

To provide a custom ID for deep-linking, add an `id` attribute to the heading in your source document (e.g., in AEM, use the "Source Edit" button).

## Programmatic Creation

The Accordion block can be created programmatically for both stacked and column layouts using the `buildBlock` helper.

### Stacked Layout Example

```javascript
import { buildBlock } from '../../scripts/aem.js';
import decorate from './accordion.js';

// Each heading and content pair is a separate row in the array.
const stackedContent = [
  ['<h3 id="custom-id-1">Heading 1 with Custom ID</h3>'],
  ['<p>Content for the first item.</p>'],
  ['<strong>Heading 2 (Default Open)</strong>'],
  ['<p>Content for the second item.</p>'],
];

const block = buildBlock('accordion', stackedContent);
document.querySelector('main').append(block);
decorate(block);
```

### Columns Layout Example

```javascript
import { buildBlock } from '../../scripts/aem.js';
import decorate from './accordion.js';

// Each row in the array represents an accordion item,
// with the heading in the first column and content in the second.
const columnsContent = [
  ['Heading 1', '<p>Content for the first item.</p>'],
  ['<h3 id="custom-id-2">Heading 2 with Custom ID</h3>', '<p>Content for the second item.</p>'],
];

const block = buildBlock('accordion', columnsContent);
document.querySelector('main').append(block);
decorate(block);
```
