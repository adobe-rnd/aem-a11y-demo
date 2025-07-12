/* eslint-disable import/no-extraneous-dependencies */
// @ts-check
import { test, expect } from '@playwright/test';
import { checkAccessibility } from 'aem-a11y-lib';
import decorate from '../../blocks/tabs/tabs.js';

/**
 * Sets up the tabs component on the page for testing.
 * @param {import('@playwright/test').Page} page
 * @param {string} html
 */
async function setupTabs(page, html) {
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.addStyleTag({ path: 'blocks/tabs/tabs.css' });

  await page.addScriptTag({
    content: `
      const decorate = ${decorate.toString()};
      const block = document.querySelector('.tabs');
      if (block) {
        decorate(block);
      }
    `,
  });

  await page.waitForTimeout(100);
}

test.describe('Visually-Dependent Accessibility Checks for Tabs Component', () => {
  const provider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY;
  const conditionalTest = provider && apiKey ? test : test.skip;

  conditionalTest('Should pass all visual accessibility checks using the configured AI provider', async ({ page }) => {
    await setupTabs(page, `
      <div class="tabs">
        <div><div><ul>
          <li><a href="#panel1">First Tab</a></li>
          <li><a href="#panel2">Second Tab</a></li>
        </ul></div></div>
        <div><div id="panel1"><p>Panel 1</p></div></div>
        <div><div id="panel2"><p>Panel 2</p></div></div>
      </div>
    `);

    const tablistHandle = await page.locator('[role="tablist"]').first().elementHandle();

    const options = {
      component: 'tabs',
      runVisualChecks: true,
      page,
      aiConfig: {
        provider,
        apiKey,
      },
    };

    await expect(checkAccessibility(tablistHandle, options)).to.not.be.rejected;
  });
});
