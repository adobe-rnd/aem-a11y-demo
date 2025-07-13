/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
  nextFrame,
} from '@open-wc/testing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { sendKeys } from '@web/test-runner-commands';
import { createSkipLinks } from '../../../scripts/a11y-core.js';
import { loadComponentCSS, getFocusIndicatorMetrics } from '../../test-helpers.js';

describe('WCAG Compliance: Skip Links', () => {
  let element;
  let main;

  before(async () => {
    await loadComponentCSS('../../../styles/a11y-core.css');
  });

  beforeEach(async () => {
    element = await fixture(html`
      <div>
        <button id="pre-focus-button">Start</button>
        <header>
          <a href="#">Home</a>
        </header>
        <main>
          <h1>Main Content</h1>
          <a href="#">A link in main</a>
        </main>
      </div>
    `);
    main = element.querySelector('main');
  });

  afterEach(() => {
    // Clean up injected links
    const skipLinksContainer = document.querySelector('.skip-links');
    if (skipLinksContainer) {
      skipLinksContainer.remove();
    }
  });

  describe('Guideline 2.4: Navigable', () => {
    it('2.4.1 Bypass Blocks (Level A)', async function test() {
      if (navigator.userAgent.includes('WebKit')) {
        this.skip();
      }
      createSkipLinks([{ href: 'main', text: 'Skip to Main Content' }], element);
      const skipLink = document.querySelector('.skip-links .skip-link');

      // Start with focus on the body, simulating a user tabbing into the page
      element.focus();
      await sendKeys({ press: 'Tab' });
      expect(document.activeElement, 'Skip link should be the first focusable element on the page').to.equal(skipLink);

      await sendKeys({ press: 'Enter' });
      await nextFrame(); // Allow focus to shift
      expect(document.activeElement, 'Activating skip link should move focus to the main element').to.equal(main);

      await sendKeys({ press: 'Tab' });
      const firstLinkInMain = main.querySelector('a');
      expect(document.activeElement, 'Tabbing from main should move focus to the first focusable element within it').to.equal(firstLinkInMain);
    });
  });

  describe('Guideline 2.4: Navigable (Continued)', () => {
    it('2.4.7 Focus Visible (Level AA)', async () => {
      createSkipLinks([{ href: 'main', text: 'Skip to Main Content' }], element);
      const skipLink = document.querySelector('.skip-links .skip-link');

      skipLink.focus();
      await nextFrame(); // Wait for styles to apply
      const linkMetrics = getFocusIndicatorMetrics(skipLink);
      expect(linkMetrics.outlineColor).to.not.equal('rgba(0, 0, 0, 0)');
      expect(linkMetrics.outlineWidth).to.be.at.least(2);

      // Test focus visibility on the target by simulating the user action
      skipLink.focus();
      await sendKeys({ press: 'Enter' });
      await nextFrame(); // Wait for the click event to fire and focus to shift

      const mainMetrics = getFocusIndicatorMetrics(main);
      expect(mainMetrics.outlineColor).to.not.equal('rgba(0, 0, 0, 0)');
      expect(mainMetrics.outlineWidth, 'Outline width of main on focus should be at least 2px').to.be.at.least(2);
    });
  });

  describe('Guideline 4.1: Compatible', () => {
    it('4.1.2 Name, Role, Value (Level A)', async () => {
      createSkipLinks([{ href: 'main', text: 'Skip to Main Content' }], element);
      const skipLink = document.querySelector('.skip-links .skip-link');
      const mainTarget = document.querySelector('main');

      // It's a link, so its implicit role is 'link'
      expect(skipLink.getAttribute('role')).to.be.null;
      // It has an accessible name from its text content
      expect(skipLink.textContent.trim()).to.equal('Skip to Main Content');
      // Its value is its href
      expect(skipLink.getAttribute('href')).to.equal(`#${mainTarget.id}`);
    });
  });
});
