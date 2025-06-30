# Accessible Tabs Block

This block transforms a list of links into a fully accessible and interactive tabbed interface, adhering to WCAG 2.2 AA/AAA guidelines and best practices for progressive enhancement.

## Features

- **Progressive Enhancement**: Works as a list of anchor links if JavaScript is disabled.
- **Accessible**: Follows ARIA patterns for tabbed interfaces (`tablist`, `tab`, `tabpanel`).
- **Keyboard Navigable**: Full keyboard support (`ArrowKeys`, `Home`, `End`).
- **Two Content Modes**: Supports both in-page content and asynchronous loading.
- **Manual Activation**: Optional mode where users must press `Enter` or `Space` to activate a tab.

---

## How to Use

### 1. Static In-Page Content (Default)

This is the standard and most robust implementation. The tab links point to content that is already on the page.

**Authoring Structure:**

1.  Create a **Tabs** block.
2.  Inside, create a bulleted list of links. Each link's `href` must be an anchor pointing to the ID of a content `div` on the same page.
3.  Create the corresponding content `div`s with matching `id` attributes.

**Example HTML:**

```html
<!-- The Tabs block itself -->
<div class="tabs">
  <div>
    <ul>
      <li><a href="#features">Product Features</a></li>
      <li><a href="#reviews">Customer Reviews</a></li>
    </ul>
  </div>
</div>

<!-- The content panels elsewhere on the page -->
<div id="features">
  <h2>Product Features</h2>
  <p>Content for the features tab...</p>
</div>

<div id="reviews">
  <h2>Customer Reviews</h2>
  <p>Content for the reviews tab...</p>
</div>
```

### 2. Asynchronous Content Loading

For content that should be loaded on-demand (e.g., from another page).

**Authoring Structure:**

1.  Follow the same structure as the static tabs.
2.  For the panel that should load content dynamically, create the `div` with a matching `id`, but place a single link inside it pointing to the `.plain.html` version of the content to be loaded.

**Example HTML:**

```html
<!-- The Tabs block itself -->
<div class="tabs">
  <div>
    <ul>
      <li><a href="#features">Product Features</a></li>
      <li><a href="#contact">Contact Us</a></li>
    </ul>
  </div>
</div>

<!-- Static panel -->
<div id="features">
  <h2>Product Features</h2>
  <p>Content for the features tab...</p>
</div>

<!-- Panel that will load content from /contact.plain.html -->
<div id="contact">
  <a href="/contact.plain.html"></a>
</div>
```

### 3. Manual Activation Mode

To enable manual activation, add the `manual` class to the tabs block. In this mode, arrow keys only move focus; `Enter` or `Space` is required to switch panels.

**Example HTML:**

```html
<div class="tabs manual">
  <div>
    <ul>
      <li><a href="#panel1">First Tab</a></li>
      <li><a href="#panel2">Second Tab</a></li>
    </ul>
  </div>
</div>
```

---

## CSS Customization

The block's appearance can be customized by overriding the following CSS custom properties at the project level:

```css
.tabs {
  --tab-border-color: #888;
  --tab-border-color-active: #005A9C;
  --tab-background-hover: #f0f0f0;
  /* ... and more */
}
```
