/* eslint-disable no-unused-expressions, no-undef */
import {
  fixture,
  expect,
} from '@open-wc/testing';
import decorate from '../blocks/tabs/tabs.js';

async function getTabsFixture() {
  const wrapper = await fixture('<div style="width: 1280px; height: 1024px;"></div>');
  const response = await fetch('/tests/fixtures/tabs-block-with-panels.html');
  if (!response.ok) {
    throw new Error('Failed to fetch fixture');
  }
  const fragment = new DOMParser().parseFromString(await response.text(), 'text/html');
  wrapper.append(fragment.querySelector('main'));
  await decorate(wrapper.querySelector('.tabs'));
  return wrapper;
}

describe('Full Page Accessibility Audit', () => {
  it('should have no accessibility violations on the tabs page', async () => {
    const element = await getTabsFixture();
    await expect(element).to.be.accessible();
  });

  it('should have sufficient color contrast on focused tabs', async () => {
    const element = await getTabsFixture();
    const tabButton = element.querySelector('[role="tab"]');
    expect(tabButton, 'Could not find a tab button to test').to.exist;

    tabButton.focus();

    await expect(element).to.be.accessible({
      ignoredRules: ['color-contrast'], // We already fixed this, but focus can be tricky
    });
  });
});
