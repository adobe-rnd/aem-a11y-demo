# Disclosure Block

The Disclosure block creates a simple widget that shows or hides a section of content. It is ideal for single, standalone sections of collapsable content like FAQs or supplemental information.

This block uses the semantic `<details>` and `<summary>` HTML elements, which provide core accessibility features out of the box.

## Features

- **Semantic HTML:** Built with `<details>` and `<summary>` for native accessibility and browser support.
- **Deep Linking:** Automatically updates the URL with a hash of the active disclosure item's ID, allowing users to share links directly to an opened section.
- **Accessible by Default:** Keyboard and screen reader support is handled natively by the browser.

## Authoring

To author a disclosure block, create a two-column table with the `disclosure` block style.

- The left column contains the visible summary text (the part that is always visible).
- The right column contains the content that will be revealed.

To have a disclosure item open by default, make its summary text **Bold** or *Italic*.

### Example

| disclosure | |
|---|---|
| Learn more about our terms | <p>Here are the detailed terms and conditions...</p> |
| *Show our privacy policy (open by default)* | <p>Here is the detailed privacy policy...</p> |

## Programmatic Creation

The Disclosure block can be created programmatically using the `buildBlock` helper. Each row in the content array represents a disclosure item.

### Example

```javascript
import { buildBlock } from '../../scripts/aem.js';
import decorate from './disclosure.js';

const content = [
  ['Summary for the first item', '<p>Content for the first item.</p>'],
  ['<em>Summary for second item (open by default)</em>', '<p>Content for the second item.</p>'],
];

const block = buildBlock('disclosure', content);
document.querySelector('main').append(block);
decorate(block);
```
