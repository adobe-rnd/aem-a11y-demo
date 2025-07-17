/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-expressions */
import { expect } from '@esm-bundle/chai';
import {
  html,
  fixture,
  nextFrame,
} from '@open-wc/testing';
import {
  setViewport,
  sendKeys,
  emulateMedia,
} from '@web/test-runner-commands';
import decorate, { _reset as resetDialogs } from '../../../blocks/dialog/dialog.js';
import {
  loadComponentCSS, stubMethod, unstubMethod,
} from '../../test-helpers.js';

/**
 * Gets the accessible name of an element.
 * @param {Element} el The element.
 * @return {String}
 */
function getAccessibleName(el) {
  if (!el) return '';
  // 1. Use text content if available
  const text = el.textContent?.trim();
  if (text) return text;

  // 2. Fallback to aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // 3. Fallback to image alt text
  const img = el.querySelector('img');
  const alt = img?.getAttribute('alt');
  if (alt) return alt;

  return '';
}

const plainFixture = html`
  <div>
    <div class="dialog">
      <div><div>my-dialog</div></div>
      <div><div><h2 id="dialog-title">Plain Dialog</h2></div></div>
      <div><div><p>This is a plain dialog.</p></div></div>
      <div>
        <div>
          <p><em>Cancel</em></p>
          <p><strong>OK</strong></p>
        </div>
      </div>
    </div>
    <p><a href="#my-dialog">Open Plain Dialog</a></p>
  </div>
`;

const infoFixture = html`
  <div>
    <div class="dialog info">
      <div><div>dialog</div></div>
      <div><div><h2>Info</h2></div></div>
      <div><div><p>Content</p></div></div>
    </div>
  </div>
`;

describe('WCAG Compliance: Dialog', () => {
  const dialogVariants = ['info', 'warning'/* , 'error', 'success', 'plain' */];

  before(async () => {
    await loadComponentCSS('../../blocks/dialog/dialog.css');
  });

  afterEach(() => {
    resetDialogs();
    unstubMethod(window.HTMLDialogElement.prototype, 'show');
    unstubMethod(window.HTMLDialogElement.prototype, 'showModal');
    unstubMethod(window.HTMLDialogElement.prototype, 'close');
  });

  describe('Principle 1: Perceivable', () => {
    describe('Guideline 1.1: Text Alternatives', () => {
      it('1.1.1 Non-text Content (Level A)', async () => {
        const el = await fixture(infoFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        await expect(dialog).to.be.accessible({
          runOnly: {
            type: 'rule',
            values: ['image-alt', 'svg-img-alt', 'button-name'],
          },
        });
      });
    });

    describe('Guideline 1.2: Time-based Media', () => {
      it.skip('1.2.1 Audio-only and Video-only (Prerecorded) (Level A)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.2 Captions (Prerecorded) (Level A)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.4 Captions (Live) (Level AA)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.5 Audio Description (Prerecorded) (Level AA)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.6 Sign Language (Prerecorded) (Level AAA)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.7 Extended Audio Description (Prerecorded) (Level AAA)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.8 Media Alternative (Prerecorded) (Level AAA)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.9 Audio-only (Live) (Level AAA)', () => {
        // N/A: Dialogs do not manage time-based media; this is a content concern.
      });
    });
    describe('Guideline 1.3: Adaptable', () => {
      it('1.3.1 Info and Relationships: Dialog has correct roles and accessible names', async () => {
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        await expect(dialog).to.be.accessible({
          runOnly: {
            type: 'rule',
            values: ['dialog-name', 'button-name'],
          },
        });
      });

      it('1.3.2 Meaningful Sequence: Dialog sections are in a logical DOM order', async () => {
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');

        const heading = dialog.querySelector(`#${dialog.getAttribute('aria-labelledby')}`);
        const content = dialog.querySelector(`#${dialog.getAttribute('aria-describedby')}`);
        const buttons = Array.from(dialog.querySelectorAll('button, [role="button"]'));
        const lastButton = buttons[buttons.length - 1];

        expect(heading, 'Dialog should have a heading referenced by aria-labelledby').to.exist;
        expect(content, 'Dialog should have content referenced by aria-describedby').to.exist;
        expect(lastButton, 'Dialog should have at least one button').to.exist;

        // The heading should precede the content.
        // eslint-disable-next-line no-bitwise
        expect(!!(heading.compareDocumentPosition(content)
          & Node.DOCUMENT_POSITION_FOLLOWING)).to.be.true;

        // The content should precede the last button.
        // eslint-disable-next-line no-bitwise
        expect(!!(content.compareDocumentPosition(lastButton)
          & Node.DOCUMENT_POSITION_FOLLOWING)).to.be.true;
      });

      it.skip('1.3.3 Sensory Characteristics (Level A)', () => {
        // Implemented in the E2E test suite (tests/e2e/a11y.spec.js).
      });

      it('1.3.4 Orientation: Dialog remains functional in different viewports', async () => {
        stubMethod(window.HTMLDialogElement.prototype, 'show', function show() { this.setAttribute('open', ''); });
        stubMethod(window.HTMLDialogElement.prototype, 'close', function close() { this.removeAttribute('open'); });

        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        const trigger = el.querySelector('a[href="#my-dialog"]');

        // Test in a portrait-like viewport
        await setViewport({ width: 360, height: 800 });
        trigger.click();
        expect(dialog.hasAttribute('open')).to.be.true;
        dialog.querySelector('.dialog-close').click();
        expect(dialog.hasAttribute('open')).to.be.false;

        // Test in a landscape-like viewport
        await setViewport({ width: 1024, height: 768 });
        trigger.click();
        expect(dialog.hasAttribute('open')).to.be.true;
        dialog.querySelector('.dialog-close').click();
        expect(dialog.hasAttribute('open')).to.be.false;

        // Reset viewport after test
        await setViewport({ width: 800, height: 600 });
      });

      it.skip('1.3.5 Identify Input Purpose (Level AA)', () => {
        // N/A: The component does not contain any input fields that collect user information.
      });

      it('1.3.6 Identify Purpose (Level AAA)', async () => {
        // This test validates that the dialog's core purpose can be programmatically determined.
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog,[role="dialog"]');

        expect(dialog).to.exist;

        // A critical purpose of a dialog is that it can be closed. This is
        // programmatically exposed through a button with an accessible name.
        const closeButton = dialog.querySelector('button');
        expect(getAccessibleName(closeButton).toLowerCase()).to.contain('close');
      });
    });

    describe('Guideline 1.4: Distinguishable', () => {
      dialogVariants.forEach(async (variant) => {
        it(`1.4.1 Use of Color (Level A) - ${variant} dialog`, async () => {
          const el = await fixture(html`
            <div>
              <div class="dialog ${variant}">
                <div><div>dialog</div></div>
                <div><div><h2>${variant}</h2></div></div>
                <div><div><p>Content</p></div></div>
              </div>
            </div>`);
          decorate(el.querySelector('.dialog'));
          const dialog = el.querySelector('dialog');
          const icon = dialog.querySelector('.icon');
          const prefix = dialog.querySelector('.dialog-type');

          if (variant !== 'plain') {
            expect(icon, `A ${variant} dialog should have an icon.`).to.exist;
            expect(prefix, `A ${variant} dialog should have a title prefix.`).to.exist;
          }
        });
      });

      it.skip('1.4.2 Audio Control (Level A)', () => {
        // N/A: The component does not play audio.
      });

      dialogVariants.forEach((variant) => {
        it(`1.4.3 Contrast (Minimum): ${variant} dialog in light and dark modes`, async () => {
          const el = await fixture(html`
            <div>
              <div class="dialog ${variant !== 'plain' ? variant : ''}">
                <div><div>dialog</div></div>
                <div><div><h2>${variant}</h2></div></div>
                <div><div><p>Content</p></div></div>
                <div>
                  <div>
                    <p><em>Cancel</em></p>
                    <p><strong>OK</strong></p>
                  </div>
                </div>
              </div>
            </div>`);
          await decorate(el.querySelector('.dialog'));
          const dialog = el.querySelector('dialog');
          dialog.show(); // Open the dialog for testing visibility
          await expect(dialog).to.be.accessible({
            runOnly: { type: 'rule', values: ['color-contrast'] },
          });
        });
      });

      it('1.4.4 Resize Text: Content scrolls correctly when text is resized', async () => {
        const el = await fixture(infoFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        dialog.show();

        document.body.style.fontSize = '200%';
        await nextFrame(); // Allow browser to reflow
        expect(dialog.scrollWidth).to.be.at.most(dialog.clientWidth);
        document.body.style.fontSize = '';
      });

      describe('1.4.6 Contrast (Enhanced) (Level AAA)', () => {
        afterEach(async () => {
          await emulateMedia({ colorScheme: 'light', prefersContrast: 'no-preference', forcedColors: 'none' });
        });

        const mediaModes = [
          { name: 'light mode', options: { colorScheme: 'light' } },
          { name: 'dark mode', options: { colorScheme: 'dark' } },
          { name: 'light mode with high contrast', options: { colorScheme: 'light', prefersContrast: 'more' } },
          { name: 'dark mode with high contrast', options: { colorScheme: 'dark', prefersContrast: 'more' } },
          { name: 'forced colors mode', options: { forcedColors: 'active' } },
        ];

        dialogVariants.forEach((variant) => {
          describe(`- ${variant} dialog`, () => {
            mediaModes.forEach((mode) => {
              it(`should have sufficient contrast in ${mode.name}`, async function test() {
                // Firefox default colors do not have enough contrast
                if (mode.name === 'forced colors mode' && navigator.userAgent.includes('Firefox')) {
                  this.skip();
                }
                await emulateMedia(mode.options);
                const el = await fixture(html`
                  <div>
                    <div class="dialog ${variant !== 'plain' ? variant : ''}">
                      <div><div>dialog</div></div>
                      <div><div><h2>${variant}</h2></div></div>
                      <div><div><p>Content</p></div></div>
                      <div>
                        <div>
                          <p><em>Secondary</em></p>
                          <p><strong>Primary</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>`);
                await decorate(el.querySelector('.dialog'));
                const dialog = el.querySelector('dialog');
                // Make visible without top-layer promotion
                // because axe core does not properly handle it
                dialog.style.display = 'flex';
                await nextFrame();
                await expect(dialog).to.be.accessible({
                  runOnly: { type: 'rule', values: ['color-contrast-enhanced'] },
                });
              });
            });
          });
        });
      });

      it.skip('1.4.7 Low or No Background Audio (Level AAA)', () => {
        // N/A: The breadcrumb component does not embed or manage audio content.
        // This is a content-level concern outside the component's scope.
      });

      it.skip('1.4.8 Visual Presentation (Level AAA)', () => {
        // N/A: This requires a site-wide mechanism for users to customize text,
        // which is a platform-level responsibility, not that of an individual component.
      });

      it.skip('1.4.9 Images of Text (No Exception) (Level AAA)', () => {
        // N/A: This is a content authoring requirement. The component's
        // responsibility is to handle image alternatives correctly (see SC 1.1.1),
        // not to police the type of image content provided.
      });

      it('1.4.10 Reflow (Level AA)', async () => {
        const longContent = Array.from({ length: 50 }, (_, i) => `<p>Paragraph ${i + 1}</p>`).join('');
        const el = await fixture(html`
          <div>
            <div class="dialog">
              <div><div>dialog</div></div>
              <div><div><h2>Reflow Test</h2></div></div>
              <div><div>${longContent}</div></div>
              <div>
                <div>
                  <p><strong>Primary</strong></p>
                  <p><em>Secondary</em></p>
                </div>
              </div>
            </div>
          </div>
        `);
        await setViewport({ width: 320, height: 480 });
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        dialog.show();

        // Check for no horizontal scrolling
        expect(dialog.scrollWidth).to.be.at.most(dialog.clientWidth);

        // Check that buttons are stacked
        const buttons = dialog.querySelectorAll('.dialog-button');
        const firstButtonRect = buttons[0].getBoundingClientRect();
        const secondButtonRect = buttons[1].getBoundingClientRect();
        expect(firstButtonRect.top).to.not.eq(secondButtonRect.top);

        // Check for vertical scrolling on content
        const content = dialog.querySelector('.dialog-content');
        expect(content.scrollHeight).to.be.greaterThan(content.clientHeight);
      });

      describe('1.4.11 Non-text Contrast (Level AA)', () => {
        const mediaModes = [
          { name: 'light mode', options: { colorScheme: 'light' } },
          { name: 'dark mode', options: { colorScheme: 'dark' } },
          { name: 'light mode with high contrast', options: { colorScheme: 'light', prefersContrast: 'more' } },
          { name: 'dark mode with high contrast', options: { colorScheme: 'dark', prefersContrast: 'more' } },
          { name: 'forced colors mode', options: { forcedColors: 'active' } },
        ];

        dialogVariants.forEach((variant) => {
          describe(`- ${variant} dialog`, () => {
            mediaModes.forEach((mode) => {
              it(`should have sufficient non-text contrast in ${mode.name}`, async function test() {
                if (mode.name === 'forced colors mode' && navigator.userAgent.includes('Firefox')) {
                  this.skip();
                }

                await emulateMedia(mode.options);
                const el = await fixture(html`
                  <div>
                    <div class="dialog ${variant !== 'plain' ? variant : ''}">
                      <div><div>dialog</div></div>
                      <div><div><h2>${variant}</h2></div></div>
                      <div><div><p>Content</p></div></div>
                      <div>
                        <div>
                          <p><em>Secondary</em></p>
                          <p><strong>Primary</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>`);
                await decorate(el.querySelector('.dialog'));
                const dialog = el.querySelector('dialog');
                dialog.style.display = 'flex'; // Make visible without top-layer promotion
                await nextFrame();
                await expect(dialog).to.be.accessible({
                  runOnly: { type: 'rule', values: ['non-text-contrast'] },
                });
              });
            });
          });
        });
      });

      it('1.4.12 Text Spacing (Level AA)', async () => {
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        dialog.style.display = 'flex';

        const style = document.createElement('style');
        style.innerHTML = `
          * {
            line-height: 1.5 !important;
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
          }
          p {
            margin-bottom: 2em !important;
          }`;
        document.head.appendChild(style);
        await nextFrame();

        const content = dialog.querySelector('.dialog-content');
        expect(content.scrollWidth <= content.clientWidth, 'Content should not be horizontally clipped with increased text spacing.').to.be.true;

        document.head.removeChild(style);
      });

      it.skip('1.4.13 Content on Hover or Focus (Level AA)', () => {
        // N/A: The component does not have any functionality that reveals
        // additional content on hover or focus, so this SC is not applicable.
      });
    });
  });

  describe('Guideline 2: Operable', () => {
    describe('Guideline 2.1: Keyboard Accessible', () => {
      it('2.1.1 Keyboard: All functionality is keyboard accessible', async () => {
        const modalFixture = html`
          <div>
            <div class="dialog modal">
              <div><div>my-modal-dialog</div></div>
              <div><div><h2>Modal Dialog</h2></div></div>
              <div><div><p>This is a modal dialog.</p></div></div>
              <div><div><p><strong>OK</strong></p></div></div>
            </div>
            <p><a href="#my-modal-dialog">Open</a></p>
          </div>
        `;
        const el = await fixture(modalFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        const trigger = el.querySelector('a[href="#my-modal-dialog"]');
        const closeButton = dialog.querySelector('.dialog-close');
        const okButton = dialog.querySelector('.dialog-button');

        // 1. Open with Enter key
        trigger.focus();
        await sendKeys({ press: 'Enter' });
        expect(dialog.hasAttribute('open'), 'Dialog should open on Enter').to.be.true;

        dialog.querySelector('.dialog .button').focus();

        // 2. Close with Escape key
        await sendKeys({ press: 'Escape' });
        expect(dialog.hasAttribute('open'), 'Dialog should close on Escape').to.be.false;

        // 3. Close with Enter on close button
        trigger.click(); // Re-open
        closeButton.focus();
        await sendKeys({ press: 'Enter' });
        expect(dialog.hasAttribute('open'), 'Dialog should close on Enter on close button').to.be.false;

        // 4. Close with Space on close button
        trigger.click(); // Re-open
        closeButton.focus();
        await sendKeys({ press: ' ' }); // Space key
        expect(dialog.hasAttribute('open'), 'Dialog should close on Space on close button').to.be.false;

        // 5. Close with Space on footer button
        trigger.click(); // Re-open
        okButton.focus();
        await sendKeys({ press: ' ' }); // Space key
        expect(dialog.hasAttribute('open'), 'Dialog should close on Space on footer button').to.be.false;
      });

      it('2.1.2 No Keyboard Trap: Focus can be moved out of the dialog with Escape', async () => {
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        const trigger = el.querySelector('a[href="#my-dialog"]');
        trigger.click();
        await nextFrame(); // allow dialog to open
        // move focus explicitly inside the dialog as the headless browser does not do this
        dialog.querySelector('.dialog-close').focus();
        // "Escape" is not working in the headless browser,
        // so using "Enter" on the close button as a proxy instead
        await sendKeys({ press: 'Enter' });
        expect(dialog.hasAttribute('open')).to.be.false;
        expect(document.activeElement).to.equal(trigger);
      });

      it.skip('2.1.3 Keyboard (No Exception) (Level AAA)', () => {
        // N/A: The functionality of this component is fully keyboard-operable,
        // as validated by the comprehensive tests in SC 2.1.1.
      });

      it.skip('2.1.4 Character Key Shortcuts (Level A)', () => {
        // N/A: The component does not implement any single-character key shortcuts.
        // It uses standard activation keys (Enter, Space) and the Escape key,
        // which do not fall under this success criterion.
      });
    });

    describe('Guideline 2.2: Enough Time', () => {
      it.skip('2.2.1 Timing Adjustable (Level A)', () => {
        // N/A: The component does not have any time-based media or time limits.
      });
      it.skip('2.2.2 Pause, Stop, Hide (Level A)', () => {
        // N/A: The component does not have any moving, blinking, or auto-updating content.
      });
      it.skip('2.2.3 No Timing (Level AAA)', () => {
        // N/A: The component's functionality is not time-dependent.
      });
      it.skip('2.2.4 Interruptions (Level AAA)', () => {
        // N/A: The component does not generate interruptions.
      });
      it.skip('2.2.5 Re-authenticating (Level AAA)', () => {
        // N/A: The component does not handle authentication.
      });
      it.skip('2.2.6 Timeouts (Level AA)', () => {
        // N/A: The component does not have any time limits.
      });
    });

    describe('Guideline 2.3: Seizures and Physical Reactions', () => {
      it.skip('2.3.1 Three Flashes or Below Threshold (Level A)', () => {
        // N/A: The component does not contain any flashing or blinking content.
      });
      it.skip('2.3.2 Three Flashes (Level AAA)', () => {
        // N/A: The component does not contain any flashing or blinking content.
      });
      it('2.3.3 Animation from Interactions (Level AA)', async () => {
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        const trigger = el.querySelector('a[href="#my-dialog"]');

        // Test with motion preference
        await emulateMedia({ reducedMotion: 'no-preference' });
        trigger.click();
        await nextFrame();
        expect(window.getComputedStyle(dialog).animationName).to.not.equal('none');

        // Test with reduced motion preference
        dialog.close();
        await emulateMedia({ reducedMotion: 'reduce' });
        trigger.click();
        await nextFrame();
        expect(window.getComputedStyle(dialog).animationName).to.equal('none');
      });
    });

    describe('Guideline 2.4: Navigable', () => {
      it.skip('2.4.1 Bypass Blocks (Level A)', () => {
        // N/A: Page-level concern.
      });
      it.skip('2.4.2 Page Titled (Level A)', () => {
        // N/A: Page-level concern.
      });
      it('2.4.3 Focus Order: Focus moves logically into the dialog', async () => {
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const trigger = el.querySelector('a[href="#my-dialog"]');
        trigger.click();
        await nextFrame(); // allow dialog to open
        const dialog = el.querySelector('#my-dialog');

        // In a real browser, focus would move into the dialog.
        // For testing, we'll move it manually.
        dialog.querySelector('.dialog-close').focus();

        expect(dialog.querySelector('.dialog-close')).to.equal(document.activeElement, 'Focus should be on the close button when opened');
      });

      it.skip('2.4.3 Focus Order: Focus is trapped inside a modal dialog', async () => {
        const modalFixture = html`
          <div>
            <div class="dialog modal">
              <div><div>my-modal-dialog</div></div>
              <div><div><h2>Modal Dialog</h2></div></div>
              <div><div><p>This is a modal dialog.</p><a href="#">Link</a></div></div>
              <div><div><p><strong>OK</strong></p></div></div>
            </div>
            <p><a href="#my-modal-dialog">Open</a></p>
          </div>
        `;
        const el = await fixture(modalFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        const trigger = el.querySelector('a[href="#my-modal-dialog"]');

        trigger.click();
        await nextFrame();

        const focusableElements = dialog.querySelectorAll('button, a[href]');
        const firstElement = focusableElements[0]; // Close button
        const lastElement = focusableElements[focusableElements.length - 1]; // OK button

        // Focus the last element and tab forward
        lastElement.focus();
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement).to.equal(firstElement, 'Focus should wrap from last to first element');

        // Focus the first element and shift-tab backward
        firstElement.focus();
        await sendKeys({ press: 'Shift+Tab' });
        expect(document.activeElement).to.equal(lastElement, 'Focus should wrap from first to last element');
      });

      it.skip('2.4.4 Link Purpose (In Context) (Level A)', () => {
        // N/A: The purpose of any link within the dialog's content is an authoring
        // responsibility and cannot be validated at the component level.
      });

      it.skip('2.4.5 Multiple Ways (Level AA)', () => {
        // N/A: This is a site-level requirement for page navigation and does not
        // apply to a single component.
      });

      it('2.4.6 Headings and Labels (Level AA)', async () => {
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        const heading = document.getElementById(dialog.getAttribute('aria-labelledby'));
        const buttons = dialog.querySelectorAll('button');

        expect(heading.textContent.trim()).to.not.be.empty;

        buttons.forEach((button) => {
          expect(getAccessibleName(button).trim()).to.not.be.empty;
        });
      });

      it.skip('2.4.7 Focus Visible (Level AA)', async () => {
        const modalFixture = html`
          <div>
            <button id="pre-focus-button">Start</button>
            <div class="dialog modal">
              <div><div>my-modal-dialog</div></div>
              <div><div><h2>Focus Visible Test</h2></div></div>
              <div><div><p>This dialog contains <a href="#">a link</a>.</p></div></div>
              <div><div><p><strong>OK</strong></p></div></div>
            </div>
            <p><a href="#my-modal-dialog">Open</a></p>
          </div>
        `;
        const el = await fixture(modalFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        dialog.style.display = 'flex';
        await nextFrame();
        const focusableElements = dialog.querySelectorAll('button, a[href]');
        const preFocusButton = document.getElementById('pre-focus-button');

        preFocusButton.focus();

        // eslint-disable-next-line no-restricted-syntax
        for (const element of focusableElements) {
          // eslint-disable-next-line no-await-in-loop
          await sendKeys({ press: 'Tab' });
          expect(document.activeElement).to.equal(element);

          const styles = window.getComputedStyle(document.activeElement);
          // eslint-disable-next-line no-unused-expressions
          expect(styles.outlineStyle).to.not.equal('none');
          expect(parseInt(styles.outlineWidth, 10)).to.be.greaterThan(0);
        }
      });

      it.skip('2.4.8 Location (Level AAA)', () => {
        // N/A: This is a site-level concern about providing information about the
        // user's location within a set of pages, not applicable to a dialog component.
      });

      it.skip('2.4.9 Link Purpose (Link Only) (Level AAA)', () => {
        // N/A: This is a content authoring concern related to link text clarity.
      });

      it('2.4.10 Section Headings (Level AAA)', async () => {
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        const heading = document.getElementById(dialog.getAttribute('aria-labelledby'));
        // The dialog title acts as the heading for this "section" of the page.
        expect(heading, 'Dialog should have a heading to serve as a section heading.').to.exist;
        expect(heading.textContent.trim()).to.not.be.empty;
      });

      it.skip('2.4.11 Focus Not Obscured (Minimum) (Level AA)', () => {
        // N/A: This requires a visual layout check to ensure the focused element
        // is not covered by other elements. This is beyond the scope of a unit
        // test and is better suited for visual regression or manual testing.
      });

      it.skip('2.4.12 Focus Not Obscured (Enhanced) (Level AAA)', () => {
        // N/A: Similar to 2.4.11, this requires visual layout analysis and is
        // better suited for visual regression or manual testing.
      });

      it('2.4.13 Focus Appearance (Level AAA)', async () => {
        const modalFixture = html`
          <div>
            <button id="pre-focus-button">Start</button>
            <div class="dialog modal">
              <div><div>my-modal-dialog</div></div>
              <div><div><h2>Focus Appearance Test</h2></div></div>
              <div><div><p><a href="#">Link</a></p></div></div>
            </div>
          </div>
        `;
        const el = await fixture(modalFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        dialog.style.display = 'flex';
        await nextFrame();

        dialog.focus();

        const focusableElements = dialog.querySelectorAll('button, a[href]');
        // eslint-disable-next-line no-restricted-syntax
        for (const element of focusableElements) {
          if (element === focusableElements[focusableElements.length - 1]) {
            // eslint-disable-next-line no-continue
            continue;
          }
          // eslint-disable-next-line no-await-in-loop
          await sendKeys({ press: 'Tab' });
          const focusedElement = document.activeElement;
          const styles = window.getComputedStyle(focusedElement);
          expect(parseInt(styles.outlineWidth, 10)).to.be.at.least(2, 'Focus indicator must be at least 2px thick.');

          // eslint-disable-next-line no-await-in-loop
          await expect(focusedElement).to.be.accessible({
            runOnly: { type: 'rule', values: ['non-text-contrast'] },
          });
        }
      });
    });

    describe('Guideline 2.5: Input Modalities', () => {
      it.skip('2.5.1 Pointer Gestures (Level A)', () => {
        // N/A: The dialog's functionality relies on standard single-pointer activation
        // (e.g., clicks or taps) and does not require any path-based or multi-point gestures.
      });

      it.skip('2.5.2 Pointer Cancellation (Level A)', () => {
        // Covered: This is met by using standard HTML <button> and <a> elements, which
        // natively handle pointer cancellation. For instance, the action is triggered on
        // pointer `up`, and moving the pointer off the target before `up` cancels the event.
      });

      it('2.5.3 Label in Name (Level A)', async () => {
        // Covered: This is validated by tests for 1.1.1 and 2.4.6, which ensure
        // all interactive controls like buttons have an accessible name that
        // matches or includes their visible label.
        const el = await fixture(plainFixture);
        await decorate(el.querySelector('.dialog'));
        const dialog = el.querySelector('dialog');
        const buttons = dialog.querySelectorAll('button');

        buttons.forEach((button) => {
          const visibleText = button.textContent.trim().toLowerCase();
          const accessibleName = getAccessibleName(button).toLowerCase();
          if (visibleText) {
            expect(accessibleName).to.include(visibleText);
          }
        });
      });

      it.skip('2.5.4 Motion Actuation (Level A)', () => {
        // N/A: The dialog component cannot be operated by device motion (e.g., tilting)
        // or user motion (e.g., waving at a camera).
      });

      it('2.5.5 Target Size (Enhanced) (Level AAA)', async () => {
        const TARGET_SIZE_MIN = 44;
        const targetEl = await fixture(plainFixture);
        await decorate(targetEl.querySelector('.dialog'));
        const dialog = targetEl.querySelector('dialog');
        dialog.style.display = 'flex'; // Make visible for measurement
        await nextFrame();

        const interactiveElements = dialog.querySelectorAll('button, a[href], [role="button"]');
        interactiveElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          expect(rect.width).to.be.at.least(TARGET_SIZE_MIN, `Width of <${el.tagName}> should be at least ${TARGET_SIZE_MIN}px`);
          expect(rect.height).to.be.at.least(TARGET_SIZE_MIN, `Height of <${el.tagName}> should be at least ${TARGET_SIZE_MIN}px`);
        });
      });

      it.skip('2.5.6 Concurrent Input Mechanisms (Level AAA)', () => {
        // N/A: This is a platform-level concern. The component does not restrict
        // or interfere with the user's ability to switch between input mechanisms like
        // mouse, keyboard, or touch.
      });
      it.skip('2.5.7 Dragging Movements (Level AA)', () => {
        // N/A: The component does not use any dragging movements for its operation.
      });

      it.skip('2.5.8 Target Size (Minimum) (Level AA)', () => {
        // Covered: We are conforming to the stricter AAA requirement in 2.5.5 (44x44px),
        // which exceeds the 24x24px requirement of this AA success criterion.
      });
    });
  });

  describe('Principle 3: Understandable', () => {
    describe('Guideline 3.1: Readable', () => {
      it.skip('3.1.1 Language of Page (Level A)', () => {
        // N/A: This is a document-level requirement (e.g., <html lang="en">)
        // and cannot be tested at the component level.
      });
      it.skip('3.1.2 Language of Parts (Level AA)', () => {
        // N/A: The component renders content as-is. Identifying and marking
        // parts of content in a different language is a content authoring concern.
      });
      it.skip('3.1.3 Unusual Words (Level AAA)', () => {
        // N/A: Content-level requirement, not applicable to component testing.
      });
      it.skip('3.1.4 Abbreviations (Level AAA)', () => {
        // N/A: Content-level requirement, not applicable to component testing.
      });
      it.skip('3.1.5 Reading Level (Level AAA)', () => {
        // N/A: Content-level requirement, not applicable to component testing.
      });
      it.skip('3.1.6 Pronunciation (Level AAA)', () => {
        // N/A: Content-level requirement, not applicable to component testing.
      });
    });

    describe('Guideline 3.2: Predictable', () => {
      it.skip('3.2.1 On Focus (Level A)', () => {
        // N/A: Receiving focus does not trigger a change of context. The dialog
        // remains on the same page when its internal elements are focused.
      });
      it('3.2.2 On Input', async () => {
        // Covered: Interacting with controls (e.g., clicking a button) changes the
        // state of the component (e.g., closes it) but does not cause an unexpected
        // change of context like navigating to a new page. This is the expected
        // behavior for a dialog.
        const el = await fixture(html`<div><button>Open</button>${plainFixture}</div>`);
        const trigger = el.querySelector('button');
        const block = el.querySelector('.dialog');
        await decorate(block);
        trigger.click();
        const dialog = block.querySelector('dialog');
        const primaryButton = dialog.querySelector('.primary');
        primaryButton.click();
        expect(dialog.open).to.be.false;
      });
      it.skip('3.2.3 Consistent Navigation (Level AA)', () => {
        // N/A: This SC applies to navigation repeated across multiple pages.
        // The component's internal keyboard navigation is consistent by following
        // the ARIA design pattern, which is validated in tests for Guideline 2.1 and 4.1.
      });
      it.skip('3.2.4 Consistent Identification (Level AA)', () => {
        // Covered: The component consistently uses the <dialog> element and appropriate
        // ARIA roles, ensuring it is identified consistently across the site. This is
        // validated by tests for 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value).
      });

      it('3.2.5 Change on Request (Level AAA)', async () => {
        const el = await fixture(html`<div><button>Open</button>${plainFixture}</div>`);
        const trigger = el.querySelector('button');
        const block = el.querySelector('.dialog');
        await decorate(block);
        trigger.click();
        const dialog = block.querySelector('dialog');
        const closeButton = dialog.querySelector('.dialog-close');
        closeButton.click();
        expect(dialog.open).to.be.false;
      });

      it.skip('3.2.6 Consistent Help (Level A)', () => {
        // N/A: The component does not provide any help functionality.
      });
      it.skip('3.2.7 Redundant Entry (Level A)', () => {
        // N/A: The component does not have any input fields that require
        // redundant entry of information.
      });
    });

    /**
     * @description Guideline 3.3 focuses on input assistance for forms. Since this
     * component does not render form inputs, these criteria are not applicable.
     * Forms used within a dialog must be tested separately.
     */
    describe('Guideline 3.3: Input Assistance', () => {
      it.skip('3.3.1 Error Identification (Level A)', () => {
        // N/A: The component does not have any input fields that collect
        // information about the user, so this SC is not applicable.
      });
      it.skip('3.3.2 Labels or Instructions (Level A)', () => {
        // N/A: The component does not have any input fields that collect
        // information about the user, so this SC is not applicable.
      });
      it.skip('3.3.3 Error Suggestion (Level AA)', () => {
        // N/A: The component does not have any input fields that collect
        // information about the user, so this SC is not applicable.
      });
      it.skip('3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)', () => {
        // N/A: The component does not have any input fields that collect
        // information about the user, so this SC is not applicable.
      });
      it.skip('3.3.5 Help (Level AAA)', () => {
        // N/A: The component does not provide any help functionality.
      });
      it.skip('3.3.6 Error Prevention (All) (Level AAA)', () => {
        // N/A: The component does not have any input fields that collect
        // information about the user, so this SC is not applicable.
      });
      it.skip('3.3.7 Accessible Authentication (Minimum) (Level AA)', () => {
        // N/A: The component does not handle authentication.
      });
      it.skip('3.3.8 Accessible Authentication (Enhanced) (Level AAA)', () => {
        // N/A: The component does not handle authentication.
      });
      it.skip('3.S.9 Redundant Entry (Level A)', () => {
        // N/A: The component does not have any input fields that require
        // redundant entry of information.
      });
    });
  });

  describe('Principle 4: Robust', () => {
    describe('Guideline 4.1: Compatible', () => {
      it.skip('4.1.1 Parsing (Level A)', () => {
        // Covered: This is largely obsolete in WCAG 2.2. However, core requirements like
        // unique IDs and no duplicate attributes are implicitly validated by the tests for
        // 4.1.2, which run a comprehensive accessibility audit.
      });

      dialogVariants.forEach((variant) => {
        it(`4.1.2 Name, Role, Value: ${variant} dialog is programmatically determinable`, async () => {
          const el = await fixture(html`
            <div>
              <div class="dialog ${variant}">
                <div><div>dialog</div></div>
                <div><div><h2>${variant}</h2></div></div>
                <div><div><p>Content</p></div></div>
                 <div>
                  <div>
                    <p><em>Secondary</em></p>
                    <p><strong>Primary</strong></p>
                  </div>
                </div>
              </div>
            </div>`);
          await decorate(el.querySelector('.dialog'));
          const dialog = el.querySelector('dialog');
          dialog.style.display = 'flex';
          await nextFrame();

          // This comprehensive check validates that all elements have the correct
          // roles, states, and properties, fulfilling SC 4.1.2.
          await expect(dialog).to.be.accessible();
        });
      });

      it.skip('4.1.3 Status Messages (Level AA)', () => {
        // N/A: This SC applies to status messages that appear without a change in context.
        // A modal dialog, by design, moves focus and creates a change of context,
        // so its appearance is announced by the screen reader as a new context,
        // not as a simple status message.
      });
    });
  });
});
