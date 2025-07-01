/* eslint-disable no-unused-expressions */
import { html, fixture, expect } from '@open-wc/testing';

describe('Progressive Enhancement - No JS', () => {
  it('should render all tab content visibly without javascript', async () => {
    // Manually fetch the HTML content of the fixture
    const response = await fetch('/tests/fixtures/tabs.html');
    if (!response.ok) {
      throw new Error('Failed to fetch tabs.html fixture');
    }
    const htmlContent = await response.text();

    // Create a container and inject the raw HTML
    // This bypasses any script execution that might be triggered by src attributes
    const container = await fixture(html`<div></div>`);
    container.innerHTML = htmlContent;

    // 1. Check that the tab "links" are just standard anchor tags
    const links = container.querySelectorAll('a');
    expect(links.length).to.be.greaterThan(0);

    // 2. Check that there are no ARIA roles, as JS hasn't run
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).to.be.null;

    // 3. Check that the panels (the content) are all present and not hidden
    const panels = container.querySelectorAll('div > div'); // The panels are direct children of the main div
    expect(panels.length).to.be.greaterThan(1);

    panels.forEach((panel) => {
      // In a no-js state, they shouldn't be hidden by 'hidden' attribute or style
      expect(panel.hasAttribute('hidden')).to.be.false;
      expect(panel.style.display).to.not.equal('none');
    });

    // 4. Run an accessibility audit on the raw component
    await expect(container).to.be.accessible();
  });
});
