/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
  waitUntil,
} from '@open-wc/testing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { emulateMedia } from '@web/test-runner-commands';
import { buildBlock } from '../../../scripts/aem.js';
import decorate from '../../../blocks/disclosure/disclosure.js';
import { loadComponentCSS } from '../../test-helpers.js';

describe('Disclosure Block', () => {
  before(async () => {
    await loadComponentCSS('../../blocks/disclosure/disclosure.css');
  });

  describe('Decoration and Layout', () => {
    it('decorates a standard stacked layout correctly', async () => {
      const element = await fixture(html`<div class="disclosure">
        <div><div>Heading 1</div></div>
        <div><div>Content 1</div></div>
      </div>`);
      decorate(element);

      const details = element.querySelector('details');
      const summary = element.querySelector('summary');
      expect(details).to.exist;
      expect(summary).to.exist;
      expect(summary.textContent).to.equal('Heading 1');
      expect(details.querySelector('.disclosure-panel-content').textContent).to.equal('Content 1');
    });

    it('decorates a columns layout correctly', async () => {
      const element = await fixture(html`<div class="disclosure">
        <div>
          <div>Heading 1</div>
          <div>Content 1</div>
        </div>
      </div>`);
      decorate(element);

      const details = element.querySelector('details');
      const summary = element.querySelector('summary');
      expect(details).to.exist;
      expect(summary).to.exist;
      expect(summary.textContent).to.equal('Heading 1');
    });
  });

  describe('Initial State', () => {
    it('should have all items closed by default', async () => {
      const element = await fixture(html`<div class="disclosure">
        <div><div>H1</div></div>
        <div><div>C1</div></div>
      </div>`);
      decorate(element);
      const details = element.querySelector('details');
      expect(details.open).to.be.false;
    });

    it('should open an item by default if its heading is bold', async () => {
      const element = await fixture(html`<div class="disclosure">
        <div><div><strong>H1</strong></div></div>
        <div><div>C1</div></div>
      </div>`);
      decorate(element);
      const details = element.querySelector('details');
      expect(details.open).to.be.true;
    });

    it('should open the correct item based on URL hash', async () => {
      window.location.hash = '#heading-to-open';
      const element = await fixture(html`<div class="disclosure">
        <div><div>H1</div></div>
        <div><div>C1</div></div>
        <div><div><h3 id="heading-to-open">H2</h3></div></div>
        <div><div>C2</div></div>
      </div>`);
      decorate(element);
      const details = element.querySelectorAll('details');
      expect(details[0].open).to.be.false;
      expect(details[1].open).to.be.true;
      window.location.hash = ''; // cleanup
    });
  });

  describe('Interaction and Behavior', () => {
    it('toggles an item on summary click', async () => {
      const element = await fixture(html`
        <div class="disclosure">
          <div><div>H1</div></div>
          <div><div>C1</div></div>
        </div>
      `);
      decorate(element);
      const details = element.querySelector('details');
      const summary = element.querySelector('summary');

      expect(details.open).to.be.false;
      summary.click();
      expect(details.open).to.be.true;
      summary.click();
      expect(details.open).to.be.false;
    });

    it('allows multiple items to be open', async () => {
      const element = await fixture(html`<div class="disclosure">
        <div><div>Disclosure Heading 1</div></div>
        <div><div><p>Disclosure Body 1</p></div></div>
        <div><div>Disclosure Heading 2</div></div>
        <div><div><p>Disclosure Body 2</p></div></div>
      </div>`);
      decorate(element);
      const summaries = element.querySelectorAll('summary');
      const details = element.querySelectorAll('details');

      summaries[0].click();
      await waitUntil(() => details[0].open);

      summaries[1].click();
      await waitUntil(() => details[1].open);

      expect(details[0].open).to.be.true;
      expect(details[1].open).to.be.true;
    });
  });

  describe('Deep Linking', () => {
    it('should update the URL hash when a panel is opened and closed', async () => {
      const element = await fixture(html`<div class="disclosure">
        <div><div><h3>First Question</h3></div></div>
        <div><div>Panel 1 Content</div></div>
      </div>`);
      await decorate(element);

      const summary = element.querySelector('summary');
      summary.click();
      await waitUntil(() => window.location.hash === `#${summary.id}`);
      expect(window.location.hash).to.equal(`#${summary.id}`);

      summary.click();
      await waitUntil(() => window.location.hash === '');
      expect(window.location.hash).to.equal('');
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens and closes with Enter key', async () => {
      const element = await fixture(html`<div class="disclosure">
        <div><div>Disclosure Heading 1</div></div>
        <div><div><p>Disclosure Body 1</p></div></div>
      </div>`);
      decorate(element);
      const summary = element.querySelector('summary');
      const details = element.querySelector('details');

      summary.focus();
      expect(document.activeElement).to.equal(summary);

      summary.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await waitUntil(() => details.open);
      expect(details.open).to.be.true;

      summary.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await waitUntil(() => !details.open);
      expect(details.open).to.be.false;
    });

    it('opens and closes with Space key', async () => {
      const element = await fixture(html`<div class="disclosure">
        <div><div>Disclosure Heading 1</div></div>
        <div><div><p>Disclosure Body 1</p></div></div>
      </div>`);
      decorate(element);
      const summary = element.querySelector('summary');
      const details = element.querySelector('details');

      summary.focus();
      summary.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space', bubbles: true }));
      await waitUntil(() => details.open);
      expect(details.open).to.be.true;

      summary.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space', bubbles: true }));
      await waitUntil(() => !details.open);
      expect(details.open).to.be.false;
    });
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode styles and maintain accessibility', async () => {
      await emulateMedia({ colorScheme: 'dark' });
      const element = await fixture(html`<div class="disclosure">
        <div><div>Disclosure Heading 1</div></div>
        <div><div><p>Disclosure Body 1</p></div></div>
        <div><div><strong>Disclosure Heading 2</strong></div></div>
        <div><div><p>Disclosure Body 2</p></div></div>
      </div>`);
      decorate(element);

      const summary = element.querySelector('summary');
      const styles = window.getComputedStyle(summary);

      // Check that a dark mode style is applied
      expect(styles.backgroundColor).to.equal('rgb(18, 18, 18)');
      expect(styles.color).to.equal('rgb(208, 208, 208)');

      // Re-run accessibility check in dark mode to ensure contrast is still valid
      await expect(element).to.be.accessible({
        runOnly: { type: 'rule', values: ['color-contrast'] },
      });

      await emulateMedia({ colorScheme: 'light' }); // Reset
    });
  });

  describe('Programmatic Creation', () => {
    it('should create a stacked disclosure from a JS object using buildBlock', async () => {
      const el = await fixture(html`<div></div>`);
      const content = [
        ['Heading 1'],
        ['Content 1'],
        ['<strong>Heading 2</strong>'], // default open
        ['Content 2'],
      ];
      const block = buildBlock('disclosure', content);
      el.append(block);
      await decorate(block);

      const details = el.querySelectorAll('details');
      expect(details.length).to.equal(2);
      expect(details[0].open).to.be.false;
      expect(details[1].open).to.be.true;
    });

    it('should create a columns disclosure from a JS object using buildBlock', async () => {
      const el = await fixture(html`<div></div>`);
      const content = [
        ['Heading 1', 'Content 1'],
        ['Heading 2', 'Content 2'],
      ];
      const block = buildBlock('disclosure', content);
      el.append(block);
      await decorate(block);

      const details = el.querySelectorAll('details');
      expect(details.length).to.equal(2);
      const summary = el.querySelector('summary');
      expect(summary.textContent).to.equal('Heading 1');
    });
  });
});
