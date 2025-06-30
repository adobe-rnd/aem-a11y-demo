import {
  html,
  fixture,
  expect,
} from '@open-wc/testing';
import decorate from '../../blocks/tabs/tabs.js';

describe('Tabs Block', () => {
  describe('Core Functionality', () => {
    let block;

    beforeEach(async () => {
      const element = await fixture(html`
        <div>
          <div class="tabs">
            <div>
              <ul>
                <li><a href="#panel1">Tab 1</a></li>
                <li><a href="#panel2">Tab 2</a></li>
              </ul>
            </div>
          </div>
          <div id="panel1">Panel 1 Content</div>
          <div id="panel2">Panel 2 Content</div>
        </div>
      `);
      block = element.querySelector('.tabs');
      decorate(block);
    });

    describe('Decoration', () => {
      it('should decorate the block and create a tablist', () => {
        const tablist = block.querySelector('[role="tablist"]');
        expect(tablist).to.exist;
        const tabs = tablist.querySelectorAll('[role="tab"]');
        expect(tabs.length).to.equal(2);
      });
    });

    describe('Initial State', () => {
      it('should set the first tab as active by default', () => {
        const firstTab = block.querySelector('[role="tab"]');
        const firstPanel = document.getElementById('panel1');
        expect(firstTab.getAttribute('aria-selected')).to.equal('true');
        expect(firstPanel.hasAttribute('hidden')).to.be.false;
      });

      it('should hide other panels by default', () => {
        const secondPanel = document.getElementById('panel2');
        expect(secondPanel.hasAttribute('hidden')).to.be.true;
      });

      it('should assign correct ARIA attributes', () => {
        const tab = block.querySelector('[role="tab"]');
        const panel = document.getElementById('panel1');
        expect(tab.getAttribute('aria-controls')).to.equal('panel1');
        expect(panel.getAttribute('aria-labelledby')).to.equal(tab.id);
      });
    });

    describe('Mouse Interaction', () => {
      it('switches to the second tab on click', () => {
        const secondTab = block.querySelectorAll('[role="tab"]')[1];
        secondTab.click();
        const firstTab = block.querySelector('[role="tab"]');
        const firstPanel = document.getElementById('panel1');
        const secondPanel = document.getElementById('panel2');
        expect(firstTab.getAttribute('aria-selected')).to.equal('false');
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');
        expect(firstPanel.hasAttribute('hidden')).to.be.true;
        expect(secondPanel.hasAttribute('hidden')).to.be.false;
      });
    });

    describe('Keyboard Navigation', () => {
      it('navigates between tabs with ArrowRight and ArrowLeft', () => {
        const [firstTab, secondTab] = block.querySelectorAll('[role="tab"]');
        expect(firstTab.getAttribute('aria-selected')).to.equal('true');
        firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(secondTab);
        secondTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        expect(firstTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(firstTab);
        firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(secondTab);
      });

      it('navigates to first and last tabs with Home and End keys', () => {
        const [firstTab, secondTab] = block.querySelectorAll('[role="tab"]');
        secondTab.click();
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');
        secondTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        expect(firstTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(firstTab);
        firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(secondTab);
      });
    });
  });

  describe('Advanced Use Cases', () => {
    let block;
    beforeEach(async () => {
      const element = await fixture(html`
        <div>
          <div class="tabs manual">
            <div>
              <ul>
                <li><a href="#panel1">Static</a></li>
                <li><a href="#panel2">Async</a></li>
              </ul>
            </div>
          </div>
          <div id="panel1">Static Content</div>
          <div id="panel2"><a href="/tests/fixtures/contact.plain.html"></a></div>
        </div>
      `);
      block = element.querySelector('.tabs');
      decorate(block);
    });

    it('should only focus, not activate, on arrow key navigation in manual mode', () => {
      const [firstTab, secondTab] = block.querySelectorAll('[role="tab"]');
      expect(firstTab.getAttribute('aria-selected')).to.equal('true');
      firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(firstTab.getAttribute('aria-selected')).to.equal('true');
      expect(secondTab.getAttribute('aria-selected')).to.equal('false');
      expect(document.activeElement).to.equal(secondTab);
    });

    it('should activate a tab on Enter key in manual mode', () => {
      const [firstTab, secondTab] = block.querySelectorAll('[role="tab"]');
      firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      secondTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(firstTab.getAttribute('aria-selected')).to.equal('false');
      expect(secondTab.getAttribute('aria-selected')).to.equal('true');
    });

    it('should load content asynchronously', async () => {
      const secondTab = block.querySelectorAll('[role="tab"]')[1];
      const panel = document.getElementById('panel2');
      expect(panel.hasAttribute('aria-busy')).to.be.false;
      secondTab.click();
      expect(panel.getAttribute('aria-busy')).to.equal('true');
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(panel.getAttribute('aria-busy')).to.be.null;
      expect(panel.textContent).to.include('Contact Us');
    });
  });
});
