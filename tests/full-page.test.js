/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
} from '@open-wc/testing';

describe('Full Page Accessibility Audit', () => {
  it('should have no accessibility violations on the tabs page', async () => {
    // Create a fixture with an iframe pointing to our test file
    const iframe = await fixture(html`<iframe src="/tests/fixtures/tabs.html" title="Tabs Component Fixture" style="width: 100%; height: 600px;"></iframe>`);

    // Wait for the iframe to load
    await new Promise((resolve) => {
      iframe.addEventListener('load', () => resolve());
    });

    // Run the accessibility check on the content of the iframe
    await expect(iframe).to.be.accessible();
  });
}); 