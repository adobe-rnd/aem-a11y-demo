/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
  oneEvent,
  waitUntil,
} from '@open-wc/testing';
import { createSkipLinks } from '../../../scripts/a11y-core.js';
import { loadComponentCSS } from '../../test-helpers.js';

describe('Feature: Skip Links', () => {
  let element;
  let main;

  before(async () => {
    await loadComponentCSS('../../../styles/a11y-core.css');
  });

  beforeEach(async () => {
    // Create a basic page structure for each test
    element = await fixture(html`
      <div>
        <header>
          <nav>
            <a href="#">Home</a>
            <a href="#">About</a>
          </nav>
        </header>
        <main>
          <h1>Main Content</h1>
        </main>
      </div>
    `);
    main = element.querySelector('main');
  });

  afterEach(() => {
    document.querySelector('.skip-links')?.remove();
  });

  it('should create and inject a skip link', () => {
    createSkipLinks([{ href: 'main', text: 'Skip to Main Content' }], element);
    const skipLink = document.querySelector('.skip-links .skip-link');
    expect(skipLink).to.exist;
    expect(skipLink.textContent).to.equal('Skip to Main Content');
  });

  it('should add the necessary attributes to the target element', () => {
    expect(main.id).to.be.empty;
    expect(main.hasAttribute('tabindex')).to.be.false;

    createSkipLinks([{ href: 'main', text: 'Skip to Main Content' }], element);

    expect(main.id).to.equal('main');
    expect(main.getAttribute('tabindex')).to.equal('-1');
  });

  it('should become visible on focus', async () => {
    createSkipLinks([{ href: 'main', text: 'Skip to Main Content' }], element);
    const skipLink = document.querySelector('.skip-links .skip-link');
    const initialStyles = window.getComputedStyle(skipLink);
    expect(initialStyles.transform).to.not.equal('none');

    // Trigger focus and wait for the transition to complete
    skipLink.focus();
    await waitUntil(() => {
      const focusedStyles = window.getComputedStyle(skipLink);
      return focusedStyles.transform === 'matrix(1, 0, 0, 1, 0, 0)';
    }, 'Skip link did not transition to visible state');

    const finalStyles = window.getComputedStyle(skipLink);
    expect(finalStyles.transform).to.equal('matrix(1, 0, 0, 1, 0, 0)');
  });

  it('should move focus to the main element on click', async () => {
    createSkipLinks([{ href: 'main', text: 'Skip to Main Content' }], element);
    const skipLink = document.querySelector('.skip-links .skip-link');

    setTimeout(() => skipLink.click());
    await oneEvent(main, 'focus');

    expect(document.activeElement).to.equal(main);
  });

  it('should not create a link if the target does not exist', () => {
    createSkipLinks([{ href: '#non-existent', text: 'Does not exist' }], element);
    const skipLink = document.querySelector('.skip-links .skip-link');
    expect(skipLink).to.not.exist;
  });

  it('should create multiple links if specified', () => {
    element.querySelector('header').id = 'header';
    createSkipLinks([
      { href: '#header', text: 'Skip to Header' },
      { href: 'main', text: 'Skip to Main Content' },
    ], element);
    const links = document.querySelectorAll('.skip-links .skip-link');
    expect(links.length).to.equal(2);
    expect(links[0].textContent).to.equal('Skip to Header');
    expect(links[1].textContent).to.equal('Skip to Main Content');
  });
});
 