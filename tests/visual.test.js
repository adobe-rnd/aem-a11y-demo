/* eslint-disable no-unused-expressions */
import { fixture, expect } from '@open-wc/testing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { visualDiff } from '@web/test-runner-visual-regression';

/**
 * Creates a visual test fixture with a fully rendered component.
 * It loads the full tabs.html page in an iframe and waits for the
 * main scripts to finish decorating the component.
 */
async function getFullRenderedFixture() {
  // Create a styled wrapper for the iframe to give it a viewport
  const wrapper = await fixture('<div style="width: 1280px; height: 1024px;"></div>');

  const iframe = document.createElement('iframe');
  iframe.src = '/tests/fixtures/tabs.html';
  iframe.title = 'Visual Test Fixture';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '1px solid #ccc';
  wrapper.appendChild(iframe);

  // Wait for the iframe to load its initial HTML
  await new Promise((resolve) => { iframe.addEventListener('load', resolve); });

  // Poll until the decoration is complete by checking for a role attribute
  await new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      if (iframe.contentDocument.querySelector('[role="tablist"]')) {
        clearInterval(interval);
        resolve();
      } else if (attempts > 50) { // Timeout after ~5s
        clearInterval(interval);
        reject(new Error('Tabs component did not decorate in time'));
      }
      attempts += 1;
    }, 100);
  });

  return wrapper;
}

describe('Visual Regression - Tabs Component', () => {
  it('should match the default appearance', async () => {
    const element = await getFullRenderedFixture();
    await visualDiff(element, 'tabs-default');
  });

  it('should match the focused appearance', async () => {
    const element = await getFullRenderedFixture();
    const iframe = element.querySelector('iframe');
    const firstTab = iframe.contentDocument.querySelector('[role="tab"]');
    expect(firstTab).to.exist;
    firstTab.focus();
    await visualDiff(element, 'tabs-focused');
  });

  it('should match the appearance with a different tab selected', async () => {
    const element = await getFullRenderedFixture();
    const iframe = element.querySelector('iframe');
    const secondTab = iframe.contentDocument.querySelectorAll('[role="tab"]')[1];
    expect(secondTab).to.exist;
    secondTab.click();

    // Wait for panel content to settle after click
    await new Promise((resolve) => { setTimeout(resolve, 100); });

    await visualDiff(element, 'tabs-second-selected');
  });
});
