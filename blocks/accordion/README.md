# Accordion Block

The Accordion block creates a vertically stacked set of interactive headings that each reveal a section of content. It is a common way to organize and condense content-heavy pages.

## Authoring

Accordions can be authored in two layouts:

1.  **Stacked Layout:** A series of heading/content pairs.
2.  **Columns Layout:** A two-column table where the left column is the heading and the right is the content.

The default open item can be set by making its heading text **Bold** or *Italic*.

## Programmatic Creation

The Accordion block can be created programmatically for both stacked and column layouts using the `buildBlock` helper.

### Stacked Layout Example

```javascript
import { buildBlock } from '../../scripts/aem.js';
import decorate from './accordion.js';

// Each heading and content pair is a separate row in the array.
const stackedContent = [
  ['Heading 1'],
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
  ['Heading 2', '<p>Content for the second item.</p>'],
];

const block = buildBlock('accordion', columnsContent);
document.querySelector('main').append(block);
decorate(block);
```
