# Tabs Block

The Tabs block creates a set of interactive tabs that control the visibility of corresponding content panels. This is a powerful component for organizing related content into a compact space.

## Authoring

A tabs block is authored in two parts:

1.  **The Tablist:** A block with a list of links. Each link's `href` must point to the ID of its corresponding panel `div` (e.g., `<a href="#panel1">`).
2.  **The Panels:** A series of `div` elements, each with an `id` that matches a link in the tablist. These `div`s should be placed directly after the tabs block.

## Programmatic Creation

Creating a tabs block programmatically also requires two steps, mirroring the authoring pattern. The tablist is created with `buildBlock`, and the panels are created as separate `div` elements.

### Example

```javascript
import { buildBlock } from '../../scripts/aem.js';
import decorate from './tabs.js';

// 1. Create the panel elements with unique IDs.
const panel1 = document.createElement('div');
panel1.id = 'prog-panel1';
panel1.innerHTML = '<h3>Panel 1</h3><p>Content for the first panel.</p>';

const panel2 = document.createElement('div');
panel2.id = 'prog-panel2';
panel2.innerHTML = '<h3>Panel 2</h3><p>Content for the second panel.</p>';

// 2. Create the tablist content, linking to the panel IDs.
const tablistContent = `
  <ul>
    <li><a href="#prog-panel1">Tab 1</a></li>
    <li><a href="#prog-panel2"><strong>Tab 2 (Default Open)</strong></a></li>
  </ul>
`;

// 3. Use buildBlock to create the tablist block.
const block = buildBlock('tabs', [[tablistContent]]);

// 4. Append the block and the panels to the page, then decorate.
const main = document.querySelector('main');
main.append(block);
main.append(panel1);
main.append(panel2);
decorate(block);
```
