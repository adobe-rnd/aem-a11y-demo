/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
  waitUntil,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import decorate from '../../blocks/tabs/tabs.js';

describe('Tabs Block', () => {
  describe('Core Functionality', () => {
    let block;

    beforeEach(async () => {
      const element = await fixture(html`
        <div>
          <div class="tabs">
            <div>
              <div>
                <ul>
                  <li><a href="#panel1">Tab 1</a></li>
                  <li><a href="#panel2">Tab 2</a></li>
                </ul>
              </div>
            </div>
            <div><div><h3 id="panel1">Panel 1 Content</h3></div></div>
            <div><div><h3 id="panel2">Panel 2 Content</h3></div></div>
          </div>
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
        const firstPanel = document.getElementById('panel1-container');
        expect(firstTab.getAttribute('aria-selected')).to.equal('true');
        expect(firstPanel.hasAttribute('hidden')).to.be.false;
      });

      it('should hide other panels by default', () => {
        const secondPanel = document.getElementById('panel2-container');
        expect(secondPanel.hasAttribute('hidden')).to.be.true;
      });

      it('should assign correct ARIA attributes', () => {
        const tab = block.querySelector('[role="tab"]');
        const panel = document.getElementById('panel1-container');
        expect(tab.getAttribute('aria-controls')).to.equal('panel1-container');
        expect(panel.getAttribute('aria-labelledby')).to.equal(tab.id);
      });
    });

    describe('Mouse Interaction', () => {
      it('switches to the second tab on click and remains accessible', async () => {
        const secondTab = block.querySelectorAll('[role="tab"]')[1];
        secondTab.click();
        const firstTab = block.querySelector('[role="tab"]');
        const firstPanel = document.getElementById('panel1-container');
        const secondPanel = document.getElementById('panel2-container');
        expect(firstTab.getAttribute('aria-selected')).to.equal('false');
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');
        expect(firstPanel.hasAttribute('hidden')).to.be.true;
        expect(secondPanel.hasAttribute('hidden')).to.be.false;
        await expect(block).to.be.accessible();
      });
    });

    describe('Keyboard Navigation', () => {
      it('navigates between tabs with ArrowRight and ArrowLeft and remains accessible', async () => {
        const [firstTab, secondTab] = block.querySelectorAll('[role="tab"]');
        expect(firstTab.getAttribute('aria-selected')).to.equal('true');

        // Navigate right
        firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(secondTab);
        await expect(block).to.be.accessible();

        // Navigate right again (wraps around)
        secondTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        expect(firstTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(firstTab);

        // Navigate left
        firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(secondTab);
      });

      it('navigates to first and last tabs with Home and End keys and remains accessible', async () => {
        const [firstTab, secondTab] = block.querySelectorAll('[role="tab"]');
        secondTab.click();
        expect(secondTab.getAttribute('aria-selected')).to.equal('true');

        // Navigate with Home key
        secondTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        expect(firstTab.getAttribute('aria-selected')).to.equal('true');
        expect(document.activeElement).to.equal(firstTab);
        await expect(block).to.be.accessible();

        // Navigate with End key
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
              <div>
                <ul>
                  <li>Static</li>
                  <li>Async</li>
                </ul>
              </div>
            </div>
            <div><div>Static Content</div></div>
            <div><div><a href="/tests/fixtures/contact.plain.html"></a></div></div>
          </div>
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
      const panel = document.getElementById(secondTab.getAttribute('aria-controls'));
      expect(panel.getAttribute('aria-busy')).to.equal('false');
      expect(panel.getAttribute('aria-live')).to.equal('polite');
      secondTab.click();
      expect(panel.getAttribute('aria-busy')).to.equal('true');
      expect(panel.getAttribute('aria-live')).to.equal('polite');
      await new Promise((resolve) => { setTimeout(resolve, 500); });
      expect(panel.getAttribute('aria-busy')).to.be.null;
      expect(panel.getAttribute('aria-live')).to.be.null;
      expect(panel.textContent).to.include('Contact Us');
    });

    it('decorates the block quickly', async () => {
      const startTime = performance.now();
      decorate(block);
      await waitUntil(() => block.querySelector('[role="tablist"]'));
      const elapsedTime = performance.now() - startTime;
      expect(elapsedTime).to.be.below(100);
    });
  });

  describe('Roving Tabindex', () => {
    it('should allow tabbing into and out of the tablist', async () => {
      const element = await fixture(html`
        <div>
          <button id="before">Before</button>
          <div class="tabs">
            <div>
              <div>
                <p>Tab 1</p>
                <p>Tab 2</p>
              </div>
            </div>
            <div><div>Panel 1</div></div>
            <div><div>Panel 2</div></div>
          </div>
          <button id="after">After</button>
        </div>
      `);
      const block = element.querySelector('.tabs');
      decorate(block);
      await waitUntil(() => block.querySelector('[role="tablist"]'));

      const beforeBtn = element.querySelector('#before');
      const afterBtn = element.querySelector('#after');
      const tabs = element.querySelectorAll('[role="tab"]');
      const [firstTab, secondTab] = tabs;

      // 1. Focus the button before the tabs
      beforeBtn.focus();
      expect(document.activeElement).to.equal(beforeBtn);

      // 2. Press Tab to move focus to the first tab
      await sendKeys({ press: 'Tab' });
      expect(document.activeElement).to.equal(firstTab);

      // 3. Navigate to the second tab with ArrowRight
      await sendKeys({ press: 'ArrowRight' });
      expect(document.activeElement).to.equal(secondTab);

      // 4. Press Tab to move focus to the button after the tabs
      await sendKeys({ press: 'Tab' });
      expect(document.activeElement).to.equal(afterBtn);

      // 5. Press Shift+Tab to move back to the second tab
      await sendKeys({ down: 'Shift' });
      await sendKeys({ press: 'Tab' });
      await sendKeys({ up: 'Shift' });
      expect(document.activeElement).to.equal(secondTab);
    });
  });

  describe('Async Content', () => {
    it('should restore the original link on a 404 error', async () => {
      const element = await fixture(html`
        <div>
          <div class="tabs">
            <div>
              <ul>
                <li><a href="#panel1">Static</a></li>
                <li><a href="#panel-404">Async (404)</a></li>
              </ul>
            </div>
          </div>
          <div><div id="panel1">Panel 1</div></div>
          <div><div id="panel-404"><a href="/this/path/will/404.plain.html">Link to 404</a></div></div>
        </div>
      `);

      const panel = element.querySelector('#panel-404');
      const originalLink = panel.querySelector('a').cloneNode(true);

      const block = element.querySelector('.tabs');
      decorate(block);
      await waitUntil(() => block.querySelector('[role="tablist"]'));

      const tabs = element.querySelectorAll('[role="tab"]');
      const asyncTab = tabs[1];

      // Click the tab to trigger the fetch
      asyncTab.click();

      // Wait until the fallback link is restored in the panel
      await waitUntil(() => panel.querySelector('a'));

      const restoredLink = panel.querySelector('a');
      expect(restoredLink).to.exist;
      expect(restoredLink.href).to.equal(originalLink.href);
      expect(restoredLink.textContent).to.equal(originalLink.textContent);
    });
  });

  describe('Deep Linking', () => {
    it('should activate the correct tab based on the URL hash', async () => {
      window.location.hash = '#panel2-content';

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
          <div id="panel1">
            <h3 id="panel1-content">Panel 1</h3>
          </div>
          <div id="panel2">
            <h3 id="panel2-content">Panel 2</h3>
          </div>
        </div>
      `);

      const block = element.querySelector('.tabs');
      await decorate(block);

      const secondTab = element.querySelectorAll('[role="tab"]')[1];
      const secondPanel = element.querySelector('#panel2-container');

      expect(secondTab.getAttribute('aria-selected')).to.equal('true');
      expect(secondPanel.hasAttribute('hidden')).to.be.false;

      // Clean up hash for subsequent tests
      window.location.hash = '';
    });
  });

  describe('Accessibility Tree', () => {
    it('should expose correct roles and states in the accessibility tree', async () => {
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
          <div id="panel1">Panel 1</div>
          <div id="panel2">Panel 2</div>
        </div>
      `);

      const block = element.querySelector('.tabs');
      await decorate(block);

      if (!window.getComputedAccessibleNode) {
        // eslint-disable-next-line no-console
        console.warn('Skipping accessibility tree test: getComputedAccessibleNode() API not available.');
        return;
      }

      const [firstTab, secondTab] = element.querySelectorAll('[role="tab"]');
      const firstPanel = element.querySelector('#panel1-container');

      // Check initial state
      const firstTabNode = await window.getComputedAccessibleNode(firstTab);
      expect(firstTabNode.role).to.equal('tab');
      expect(firstTabNode.selected).to.be.true;

      const secondTabNode = await window.getComputedAccessibleNode(secondTab);
      expect(secondTabNode.selected).to.be.false;

      // Check that the panel is exposed and correctly labelled by the tab
      const panelNode = await window.getComputedAccessibleNode(firstPanel);
      expect(panelNode.role).to.equal('tabpanel');
      expect(panelNode.name).to.equal('Tab 1');

      // Switch tabs and re-validate
      secondTab.click();
      await waitUntil(() => secondTab.getAttribute('aria-selected') === 'true');

      const updatedFirstTabNode = await window.getComputedAccessibleNode(firstTab);
      const updatedSecondTabNode = await window.getComputedAccessibleNode(secondTab);

      expect(updatedFirstTabNode.selected).to.be.false;
      expect(updatedSecondTabNode.selected).to.be.true;

      // Check that the second panel is now correctly labelled
      const secondPanel = element.querySelector('#panel2-container');
      const updatedPanelNode = await window.getComputedAccessibleNode(secondPanel);
      expect(updatedPanelNode.name).to.equal('Tab 2');
    });
  });
});
