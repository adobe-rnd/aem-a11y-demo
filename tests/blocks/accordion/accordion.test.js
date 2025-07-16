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
import decorate from '../../../blocks/accordion/accordion.js';
import { loadComponentCSS } from '../../test-helpers.js';

describe('Accordion Block', () => {
  before(async () => {
    await loadComponentCSS('../../blocks/accordion/accordion.css');
  });

  describe('Decoration and Layout', () => {
    it('decorates a standard stacked layout correctly', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Heading 1</div></div>
        <div><div>Content 1</div></div>
      </div>`);
      decorate(element);

      const details = element.querySelector('details');
      const summary = element.querySelector('summary');
      expect(details).to.exist;
      expect(summary).to.exist;
      expect(summary.textContent).to.equal('Heading 1');
      expect(details.querySelector('.accordion-panel-content').textContent).to.equal('Content 1');
    });

    it('decorates a columns layout correctly', async () => {
      const element = await fixture(html`<div class="accordion">
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
      const element = await fixture(html`<div class="accordion">
        <div><div>H1</div></div>
        <div><div>C1</div></div>
      </div>`);
      decorate(element);
      const details = element.querySelector('details');
      expect(details.open).to.be.false;
    });

    it('should open an item by default if its heading is bold', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div><strong>H1</strong></div></div>
        <div><div>C1</div></div>
      </div>`);
      decorate(element);
      const details = element.querySelector('details');
      expect(details.open).to.be.true;
    });

    it('should open the correct item based on URL hash', async () => {
      window.location.hash = '#heading-to-open';
      const element = await fixture(html`<div class="accordion">
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
        <div class="accordion">
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

    it('closes other items in single-select mode', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div><strong>Accordion Heading 2</strong></div></div>
        <div><div><p>Accordion Body 2</p></div></div>
      </div>`);
      decorate(element);
      const summaries = element.querySelectorAll('summary');
      const details = element.querySelectorAll('details');

      summaries[0].click();
      await waitUntil(() => details[0].open);
      expect(details[0].open).to.be.true;
      expect(details[1].open).to.be.false;

      summaries[1].click();
      await waitUntil(() => details[1].open);
      expect(details[1].open).to.be.true;
      await waitUntil(() => !details[0].open);
      expect(details[0].open).to.be.false;
    });

    it('allows multiple items to be open in multi-select mode', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div>Accordion Heading 2</div></div>
        <div><div><p>Accordion Body 2</p></div></div>
      </div>`);
      element.classList.add('multi-select');
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

  describe('Keyboard Navigation', () => {
    it('navigates between summaries with ArrowDown and ArrowUp', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div><strong>Accordion Heading 2</strong></div></div>
        <div><div><p>Accordion Body 2</p></div></div>
      </div>`);
      decorate(element);
      const summaries = element.querySelectorAll('summary');

      summaries[0].focus();
      expect(document.activeElement).to.equal(summaries[0]);

      summaries[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).to.equal(summaries[1]);

      summaries[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(document.activeElement).to.equal(summaries[0]);
    });

    it('navigates to first and last summaries with Home and End keys', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div>Accordion Heading 2</div></div>
        <div><div><p>Accordion Body 2</p></div></div>
      </div>`);
      decorate(element);
      const summaries = element.querySelectorAll('summary');

      summaries[0].focus();
      summaries[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      expect(document.activeElement).to.equal(summaries[1]);

      summaries[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(document.activeElement).to.equal(summaries[0]);
    });
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode styles and maintain accessibility', async () => {
      await emulateMedia({ colorScheme: 'dark' });
      const element = await fixture(html`<div class="accordion">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div><strong>Accordion Heading 2</strong></div></div>
        <div><div><p>Accordion Body 2</p></div></div>
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
    it('should create a stacked accordion from a JS object using buildBlock', async () => {
      const el = await fixture(html`<div></div>`);
      const content = [
        ['Heading 1'],
        ['Content 1'],
        ['<strong>Heading 2</strong>'], // default open
        ['Content 2'],
      ];
      const block = buildBlock('accordion', content);
      el.append(block);
      await decorate(block);

      const details = el.querySelectorAll('details');
      expect(details.length).to.equal(2);
      expect(details[0].open).to.be.false;
      expect(details[1].open).to.be.true;
    });

    it('should create a columns accordion from a JS object using buildBlock', async () => {
      const el = await fixture(html`<div></div>`);
      const content = [
        ['Heading 1', 'Content 1'],
        ['Heading 2', 'Content 2'],
      ];
      const block = buildBlock('accordion', content);
      el.append(block);
      await decorate(block);

      const details = el.querySelectorAll('details');
      expect(details.length).to.equal(2);
      const summary = el.querySelector('summary');
      expect(summary.textContent).to.equal('Heading 1');
    });
  });
});
