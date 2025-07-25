/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
  waitUntil,
} from '@open-wc/testing';
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
      await decorate(element);

      const item = element.querySelector('.accordion-item');
      const button = element.querySelector('.accordion-heading button');
      const panel = element.querySelector('.accordion-panel');
      expect(item).to.exist;
      expect(button).to.exist;
      expect(panel).to.exist;
      expect(button.textContent).to.equal('Heading 1');
      expect(panel.textContent.trim()).to.equal('Content 1');
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

    it('should open the correct item based on URL hash using an author-provided ID', async () => {
      window.location.hash = '#heading-to-open';
      const el = await fixture(html`
        <div class="accordion">
          <div><div><h3 id="heading-to-open">My Question</h3></div></div>
          <div><div>My Answer</div></div>
        </div>
      `);
      await decorate(el);

      const button = el.querySelector('#heading-to-open');
      expect(button.getAttribute('aria-expanded')).to.equal('true');
      window.location.hash = ''; // cleanup
    });
  });

  describe('Interaction and Behavior', () => {
    it('toggles a panel on button click', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>H1</div></div>
        <div><div>C1</div></div>
      </div>`);
      await decorate(element);
      const button = element.querySelector('button');

      expect(button.getAttribute('aria-expanded')).to.equal('false');
      button.click();
      expect(button.getAttribute('aria-expanded')).to.equal('true');
      button.click();
      expect(button.getAttribute('aria-expanded')).to.equal('false');
    });

    it('closes other items in single-select mode', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div>H1</div></div><div><div>C1</div></div>
        <div><div>H2</div></div><div><div>C2</div></div>
      </div>`);
      await decorate(element);
      const buttons = element.querySelectorAll('button');

      buttons[0].click();
      await waitUntil(() => buttons[0].getAttribute('aria-expanded') === 'true');

      buttons[1].click();
      await waitUntil(() => buttons[1].getAttribute('aria-expanded') === 'true');
      expect(buttons[0].getAttribute('aria-expanded')).to.equal('false');
    });
  });

  describe('Deep Linking', () => {
    it('should update the URL hash when a panel is opened and closed', async () => {
      const element = await fixture(html`<div class="accordion">
        <div><div><h3>First Question</h3></div></div>
        <div><div>Panel 1 Content</div></div>
      </div>`);
      await decorate(element);

      const button = element.querySelector('button');
      button.click();
      await waitUntil(() => window.location.hash === `#${button.id}`);
      expect(window.location.hash).to.equal(`#${button.id}`);

      button.click();
      await waitUntil(() => window.location.hash === '');
      expect(window.location.hash).to.equal('');
    });
  });
});
