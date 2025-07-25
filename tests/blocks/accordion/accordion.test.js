/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
  waitUntil,
} from '@open-wc/testing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { emulateMedia, sendKeys } from '@web/test-runner-commands';
import { buildBlock } from '../../../scripts/aem.js';
import decorate from '../../../blocks/accordion/accordion.js';
import { loadComponentCSS } from '../../test-helpers.js';

describe('Accordion Block', () => {
  before(async () => {
    await loadComponentCSS('../../blocks/accordion/accordion.css');
  });

  beforeEach(() => {
    window.location.hash = '';
  });

  describe('Decoration and Layout', () => {
    it('decorates a standard stacked layout correctly', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Heading 1</div></div>
        <div><div>Content 1</div></div>
      </div>`);
      await decorate(element);

      const item = element.querySelector('.accordion-item');
      const button = element.querySelector('button');
      const panel = element.querySelector('.accordion-panel');
      expect(item).to.exist;
      expect(button).to.exist;
      expect(panel).to.exist;
      expect(button.textContent.trim()).to.equal('Heading 1');
      expect(panel.textContent.trim()).to.equal('Content 1');
    });

    it('decorates a columns layout correctly', async () => {
      const element = await fixture(html`<div class="accordion">
        <div>
          <div>Heading 1</div>
          <div>Content 1</div>
        </div>
      </div>`);
      await decorate(element);

      const item = element.querySelector('.accordion-item');
      const button = element.querySelector('button');
      expect(item).to.exist;
      expect(button).to.exist;
      expect(button.textContent.trim()).to.equal('Heading 1');
    });
  });

  describe('Initial State', () => {
    it('should have all items closed by default', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>H1</div></div>
        <div><div>C1</div></div>
      </div>`);
      await decorate(element);
      const button = element.querySelector('button');
      expect(button.getAttribute('aria-expanded')).to.equal('false');
    });

    it('should open an item by default if its heading is bold', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div><strong>H1</strong></div></div>
        <div><div>C1</div></div>
      </div>`);
      await decorate(element);
      const button = element.querySelector('button');
      expect(button.getAttribute('aria-expanded')).to.equal('true');
    });

    it('should open the correct item based on URL hash', async () => {
      window.location.hash = '#heading-to-open-button';
      const element = await fixture(html`<div class="accordion">
        <div><div>H1</div></div>
        <div><div>C1</div></div>
        <div><div><h3 id="heading-to-open">H2</h3></div></div>
        <div><div>C2</div></div>
      </div>`);
      await decorate(element);
      const buttons = element.querySelectorAll('button');
      expect(buttons[0].getAttribute('aria-expanded')).to.equal('false');
      expect(buttons[1].getAttribute('aria-expanded')).to.equal('true');
    });
  });

  describe('Interaction and Behavior', () => {
    it('toggles an item on button click', async () => {
      const element = await fixture(html`
        <div class="accordion">
          <div><div>H1</div></div>
          <div><div>C1</div></div>
        </div>
      `);
      await decorate(element);
      const button = element.querySelector('button');
      const panel = element.querySelector('.accordion-panel');

      expect(button.getAttribute('aria-expanded')).to.equal('false');
      expect(panel.hidden).to.be.true;

      button.click();
      await waitUntil(() => button.getAttribute('aria-expanded') === 'true');
      expect(panel.hidden).to.be.false;

      button.click();
      await waitUntil(() => button.getAttribute('aria-expanded') === 'false');
      expect(panel.hidden).to.be.true;
    });

    it('closes other items in single-select mode', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div><strong>Accordion Heading 2</strong></div></div>
        <div><div><p>Accordion Body 2</p></div></div>
      </div>`);
      await decorate(element);
      const buttons = element.querySelectorAll('button');

      buttons[0].click();
      await waitUntil(() => buttons[0].getAttribute('aria-expanded') === 'true');
      expect(buttons[1].getAttribute('aria-expanded')).to.equal('false');

      buttons[1].click();
      await waitUntil(() => buttons[1].getAttribute('aria-expanded') === 'true');
      expect(buttons[0].getAttribute('aria-expanded')).to.equal('false');
    });

    it('allows multiple items to be open in multi-select mode', async () => {
      const element = await fixture(html`<div class="accordion multi-select">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div>Accordion Heading 2</div></div>
        <div><div><p>Accordion Body 2</p></div></div>
      </div>`);
      await decorate(element);
      const buttons = element.querySelectorAll('button');

      buttons[0].click();
      await waitUntil(() => buttons[0].getAttribute('aria-expanded') === 'true');

      buttons[1].click();
      await waitUntil(() => buttons[1].getAttribute('aria-expanded') === 'true');

      expect(buttons[0].getAttribute('aria-expanded')).to.be.equal('true');
      expect(buttons[1].getAttribute('aria-expanded')).to.be.equal('true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates between buttons with ArrowDown and ArrowUp', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div><strong>Accordion Heading 2</strong></div></div>
        <div><div><p>Accordion Body 2</p></div></div>
      </div>`);
      await decorate(element);
      const buttons = element.querySelectorAll('button');

      buttons[0].focus();
      expect(document.activeElement).to.equal(buttons[0]);

      await sendKeys({ press: 'ArrowDown' });
      expect(document.activeElement).to.equal(buttons[1]);

      await sendKeys({ press: 'ArrowUp' });
      expect(document.activeElement).to.equal(buttons[0]);
    });

    it('navigates to first and last buttons with Home and End keys', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>Accordion Heading 1</div></div>
        <div><div><p>Accordion Body 1</p></div></div>
        <div><div>Accordion Heading 2</div></div>
        <div><div><p>Accordion Body 2</p></div></div>
      </div>`);
      await decorate(element);
      const buttons = element.querySelectorAll('button');

      buttons[0].focus();
      await sendKeys({ press: 'End' });
      expect(document.activeElement).to.equal(buttons[1]);

      await sendKeys({ press: 'Home' });
      expect(document.activeElement).to.equal(buttons[0]);
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
      await decorate(element);

      const button = element.querySelector('button');
      const styles = window.getComputedStyle(button);

      // A simple check to ensure dark mode styles are different from default light.
      expect(styles.backgroundColor).to.not.equal('rgb(255, 255, 255)');
      expect(styles.color).to.not.equal('rgb(0, 0, 0)');

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

      const buttons = el.querySelectorAll('button');
      expect(buttons.length).to.equal(2);
      expect(buttons[0].getAttribute('aria-expanded')).to.equal('false');
      expect(buttons[1].getAttribute('aria-expanded')).to.equal('true');
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

      const buttons = el.querySelectorAll('button');
      expect(buttons.length).to.equal(2);
      const button = el.querySelector('button');
      expect(button.textContent.trim()).to.equal('Heading 1');
    });
  });
});
