# Dialog Block

The Dialog block creates an accessible dialog, which can be configured as a modal or non-modal. It supports deep linking and can be created programmatically.

## Authoring

See the [Dialog Test Document](https://main--aem-a11y-demo--ramboz.hlx.live/drafts/ramboz/dialog-test-document) for examples of all authoring patterns.

## Programmatic Creation

The Dialog block can be created programmatically using the `buildBlock` helper from `aem.js`.

### Example

```javascript
import { buildBlock } from '../../scripts/aem.js';
import decorate from './dialog.js';

// The content is a 2D array representing the rows and columns of the block.
const dialogContent = [
  ['my-programmatic-dialog'], // Row 1: Explicit ID (optional)
  ['<h2>Programmatic Dialog</h2>'], // Row 2: Title
  ['<p>This was created by JS!</p>'], // Row 3: Content
  ['<p><strong><a href="#">Confirm</a></strong></p>'] // Row 4: Footer buttons
];

// Create the block DOM structure
const block = buildBlock('dialog', dialogContent);

// Append the block to the page and decorate it
document.querySelector('main').append(block);
decorate(block);
``` 