# Breadcrumb Block

The Breadcrumb block displays the hierarchical path to the current page, providing users with a clear navigational trail. It is an essential component for site usability and SEO.

## Authoring

A breadcrumb is authored as a simple unordered (`<ul>`) or ordered (`<ol>`) list of links. The last item in the list represents the current page and should typically not be a link.

## Programmatic Creation

The Breadcrumb block can be created programmatically using the `buildBlock` helper. The content should be a string containing a `<ul>` or `<ol>` element.

### Example

```javascript
import { buildBlock } from '../../scripts/aem.js';
import decorate from './breadcrumb.js';

// The content is a string containing the list HTML.
const breadcrumbList = `
  <ul>
    <li><a href="/link1">Home</a></li>
    <li><a href="/link2">Category</a></li>
    <li>Current Page</li>
  </ul>
`;

// Create the block DOM structure.
// The content is wrapped in a 2D array.
const block = buildBlock('breadcrumb', [[breadcrumbList]]);

// Append the block to the page and decorate it.
document.querySelector('main').append(block);
decorate(block);
``` 