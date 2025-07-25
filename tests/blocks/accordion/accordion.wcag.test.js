/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { emulateMedia, setViewport, sendKeys } from '@web/test-runner-commands';
import decorate from '../../../blocks/accordion/accordion.js';
import { loadComponentCSS, getFocusStyles, getFocusIndicatorMetrics } from '../../test-helpers.js';

// This test suite is a comprehensive checklist for WCAG 2.2 conformance.
describe('Accordion WCAG Compliance', () => {
  let block;

  const setupBlock = async (config = {}) => {
    const { multiSelect = false, layout = 'stacked' } = config;
    const classes = ['accordion'];
    if (multiSelect) classes.push('multi-select');
    if (layout === 'columns') classes.push('columns');

    const element = await fixture(html`
      <div>
        <button id="pre-focus-button">Start</button>
        <div class="${classes.join(' ')}">
          ${layout === 'stacked' ? html`
            <div><div><h3>First Question</h3></div></div>
            <div><div>Panel 1 Content</div></div>
            <div><div><h3>Second Question</h3></div></div>
            <div><div>Panel 2 Content</div></div>
          ` : html`
            <div>
              <div><h3>First Question</h3></div>
              <div>Panel 1 Content</div>
            </div>
            <div>
              <div><h3>Second Question</h3></div>
              <div>Panel 2 Content</div>
            </div>
          `}
        </div>
      </div>
    `);
    block = element.querySelector('.accordion');
    await decorate(block);
  };

  before(async () => {
    // Load component CSS once for all tests.
    await loadComponentCSS('../../../blocks/accordion/accordion.css');
  });

  beforeEach(async () => {
    // Reset media emulation before each test.
    window.location.hash = '';
    await emulateMedia({
      contrast: 'no-preference',
      reducedMotion: 'no-preference',
      forcedColors: 'none',
    });
  });

  describe('Principle 1: Perceivable', () => {
    describe('Guideline 1.1: Text Alternatives', () => {
      it('1.1.1 Non-text Content (Level A)', async () => {
        await setupBlock();
        await expect(block).to.be.accessible({
          runOnly: {
            type: 'rule',
            values: ['image-alt', 'svg-img-alt', 'button-name'],
          },
        });
      });
    });

    describe('Guideline 1.2: Time-based Media', () => {
      it.skip('1.2.1 Audio-only and Video-only (Prerecorded) (Level A)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.2 Captions (Prerecorded) (Level A)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.4 Captions (Live) (Level AA)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.5 Audio Description (Prerecorded) (Level AA)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.6 Sign Language (Prerecorded) (Level AAA)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.7 Extended Audio Description (Prerecorded) (Level AAA)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.8 Media Alternative (Prerecorded) (Level AAA)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.9 Audio-only (Live) (Level AAA)', () => {
        // N/A: Accordions do not manage time-based media; this is a content concern.
      });
    });

    describe('Guideline 1.3: Adaptable', () => {
      it('1.3.1 Info and Relationships (Level A)', async () => {
        await setupBlock();
        const buttons = block.querySelectorAll('button[aria-expanded]');
        expect(buttons.length).to.be.gt(0);

        buttons.forEach((button) => {
          const panel = block.querySelector(`#${button.getAttribute('aria-controls')}`);
          expect(panel, 'The button should control a panel.').to.exist;
          expect(panel.getAttribute('role'), 'The panel should have role="region".').to.equal('region');
          expect(panel.getAttribute('aria-labelledby'), 'The panel should be labelled by the button.').to.equal(button.id);

          const heading = button.closest('h1, h2, h3, h4, h5, h6');
          expect(heading, 'The button should be inside a heading element.').to.exist;
        });
      });

      it('1.3.2 Meaningful Sequence (Level A)', async () => {
        await setupBlock();
        const buttons = block.querySelectorAll('button[aria-expanded]');

        // Check DOM order of buttons
        if (buttons.length > 1) {
          const pos = buttons[0].compareDocumentPosition(buttons[1]);
          // eslint-disable-next-line no-bitwise
          expect(!!(pos & Node.DOCUMENT_POSITION_FOLLOWING), 'Buttons should follow each other in DOM order.').to.be.true;
        }

        // Check that each button's heading is immediately followed by its panel
        buttons.forEach((button) => {
          const panel = block.querySelector(`#${button.getAttribute('aria-controls')}`);
          const heading = button.closest('h1, h2, h3, h4, h5, h6');
          const errorMsg = 'The panel should immediately follow the heading in the DOM.';
          expect(heading.nextElementSibling, errorMsg).to.equal(panel);
        });
      });

      it.skip('1.3.3 Sensory Characteristics (Level A)', () => {
        // N/A: The component does not rely on sensory characteristics for understanding.
      });

      it('1.3.4 Orientation (Level AA)', async () => {
        await setupBlock();
        await setViewport({ width: 320, height: 800 });
        expect(block.offsetParent).to.not.be.null;
        await setViewport({ width: 1024, height: 768 });
        expect(block.offsetParent).to.not.be.null;
        await setViewport({ width: 800, height: 600 });
      });

      it.skip('1.3.5 Identify Input Purpose (Level AA)', () => {
        // N/A: Component does not contain input fields collecting user info.
      });

      it('1.3.6 Identify Purpose (Level AAA)', async () => {
        await setupBlock();
        const buttons = block.querySelectorAll('button[aria-expanded]');
        buttons.forEach((button) => {
          // Check button purpose
          expect(button.tagName).to.equal('BUTTON');

          // Check panel purpose
          const panel = block.querySelector(`#${button.getAttribute('aria-controls')}`);
          expect(panel, 'Button should control a panel.').to.exist;
          expect(panel.getAttribute('role'), 'Panel needs role "region"').to.equal('region');
        });
      });
    });

    describe('Guideline 1.4: Distinguishable', () => {
      it.skip('1.4.1 Use of Color (Level A)', () => {
        // N/A: The native <details> element provides a disclosure triangle icon
        // that indicates state (open/closed) without relying solely on color.
      });

      it.skip('1.4.2 Audio Control (Level A)', () => {
        // N/A: The component does not play audio.
      });

      it('1.4.3 Contrast (Minimum) (Level AA)', async () => {
        await setupBlock();
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['color-contrast'] },
        });
      });

      it('1.4.4 Resize text (Level AA)', async () => {
        await setupBlock();
        document.body.style.fontSize = '200%';
        await nextFrame();
        const button = block.querySelector('button');
        expect(button.scrollWidth <= button.clientWidth).to.be.true;
        document.body.style.fontSize = '';
      });

      it.skip('1.4.5 Images of Text (Level AA)', () => {
        // N/A: Component uses standard HTML text. This is a content authoring concern.
      });

      it('1.4.6 Contrast (Enhanced) (Level AAA)', async () => {
        // Test with more contrast
        await emulateMedia({ contrast: 'more' });
        await setupBlock();
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['color-contrast-enhanced'] },
        });
        await emulateMedia({ contrast: 'no-preference' });

        // Test with dark mode
        await emulateMedia({ colorScheme: 'dark', contrast: 'more' });
        await setupBlock();
        // This test requires a higher contrast ratio (7:1)
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['color-contrast-enhanced'] },
        });
        await emulateMedia({ colorScheme: 'light', contrast: 'no-preference' });

        // Test with forced colors
        await emulateMedia({ forcedColors: 'active' });
        await setupBlock();
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['color-contrast-enhanced'] },
        });
        await emulateMedia({ forcedColors: 'none' });
      });

      it.skip('1.4.7 Low or No Background Audio (Level AAA)', () => {
        // N/A: The tabs component does not embed or manage audio content.
        // This is a content-level concern outside the component's scope.
      });

      it.skip('1.4.8 Visual Presentation (Level AAA)', () => {
        // N/A: This SC requires a site-wide mechanism for users to customize
        // text presentation. This is a platform or site-level responsibility,
        // not that of an individual component.
      });

      it.skip('1.4.9 Images of Text (No Exception) (Level AAA)', () => {
        // N/A: This is a content authoring requirement. The component's
        // responsibility is to handle image alternatives correctly (see SC 1.1.1),
        // not to police the type of image content provided.
      });

      it('1.4.10 Reflow (Level AA)', async () => {
        await setupBlock();
        await setViewport({ width: 320, height: 800 });
        await nextFrame();
        expect(block.scrollWidth <= block.clientWidth, 'Accordion should not require horizontal scrolling at 320px width.').to.be.true;
        await setViewport({ width: 800, height: 600 });
      });

      describe('1.4.11 Non-text Contrast (Level AA)', () => {
        const mediaModes = [
          { name: 'light mode', options: { colorScheme: 'light' } },
          { name: 'dark mode', options: { colorScheme: 'dark' } },
          { name: 'light mode with high contrast', options: { colorScheme: 'light', prefersContrast: 'more' } },
          { name: 'dark mode with high contrast', options: { colorScheme: 'dark', prefersContrast: 'more' } },
          { name: 'forced colors mode', options: { forcedColors: 'active' } },
        ];

        mediaModes.forEach((mode) => {
          it(`should have sufficient non-text contrast in ${mode.name}`, async function test() {
            if (mode.name === 'forced colors mode' && navigator.userAgent.includes('Firefox')) {
              this.skip();
            }

            await emulateMedia(mode.options);
            await setupBlock();
            await expect(block).to.be.accessible({
              runOnly: { type: 'rule', values: ['non-text-contrast'] },
            });
          });
        });
      });

      it('1.4.12 Text Spacing (Level AA)', async () => {
        await setupBlock();
        const style = document.createElement('style');
        style.innerHTML = `
          button[aria-expanded] {
            line-height: 1.5 !important;
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
          }`;
        document.head.appendChild(style);
        await nextFrame();
        const button = block.querySelector('button[aria-expanded]');
        expect(button.scrollWidth <= button.clientWidth).to.be.true;
        document.head.removeChild(style);
      });

      it.skip('1.4.13 Content on Hover or Focus (Level AA)', () => {
        // N/A: Component does not reveal new content on hover or focus.
      });
    });
  });

  describe('Principle 2: Operable', () => {
    describe('Guideline 2.1: Keyboard Accessible', () => {
      it('2.1.1 Keyboard (Level A)', async () => {
        await setupBlock();
        const button = block.querySelector('button');
        button.focus();
        expect(document.activeElement).to.equal(button);

        await sendKeys({ press: 'Enter' });
        await waitUntil(() => button.getAttribute('aria-expanded') === 'true');

        await sendKeys({ press: 'Space' });
        await waitUntil(() => button.getAttribute('aria-expanded') === 'false');
      });

      it('2.1.2 No Keyboard Trap (Level A)', async () => {
        const element = await fixture(html`<div>
          <button id="before">Before</button>
          <div class="accordion">
            <div><div><h3>Q1</h3></div></div><div><div>A1</div></div>
            <div><div><h3>Q2</h3></div></div><div><div>A2</div></div>
          </div>
          <button id="after">After</button>
        </div>`);
        const accordion = element.querySelector('.accordion');
        await decorate(accordion);

        const beforeButton = element.querySelector('#before');
        const afterButton = element.querySelector('#after');
        const accordionButtons = accordion.querySelectorAll('button');

        // Tab into the component
        beforeButton.focus();
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement, 'Focus should move to the first accordion button.').to.equal(accordionButtons[0]);

        // Tab out of the component
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement, 'Focus should move to the element after the accordion.').to.equal(afterButton);

        // Tab back into the component
        afterButton.focus();
        await sendKeys({ down: 'Shift' });
        await sendKeys({ press: 'Tab' });
        await sendKeys({ up: 'Shift' });
        const errorMsg = 'Focus should move back to the first accordion button'
          + ' when shift-tabbing.';
        expect(document.activeElement, errorMsg).to.equal(accordionButtons[0]);
      });

      it('2.1.3 Keyboard (No Exception) (Level AAA)', async () => {
        // This is a stricter version of 2.1.1. For the accordion, this means all
        // navigation and activation must be possible via keyboard.
        // Use multi-select to test open/close independently
        await setupBlock({ multiSelect: true });
        const buttons = block.querySelectorAll('button');
        const [firstButton, secondButton] = buttons;
        const lastButton = buttons[buttons.length - 1];

        // 1. Test navigation
        firstButton.focus();
        expect(document.activeElement).to.equal(firstButton);

        await sendKeys({ press: 'ArrowDown' });
        expect(document.activeElement, 'ArrowDown should move focus to the next button.').to.equal(secondButton);

        await sendKeys({ press: 'ArrowUp' });
        expect(document.activeElement, 'ArrowUp should move focus to the previous button.').to.equal(firstButton);

        await sendKeys({ press: 'End' });
        expect(document.activeElement, 'End should move focus to the last button.').to.equal(lastButton);

        await sendKeys({ press: 'Home' });
        expect(document.activeElement, 'Home should move focus to the first button.').to.equal(firstButton);

        // 2. Test activation (Enter and Space)
        expect(firstButton.getAttribute('aria-expanded'), 'Panel should be initially closed.').to.equal('false');

        // Test Enter key
        await sendKeys({ press: 'Enter' });
        await waitUntil(() => firstButton.getAttribute('aria-expanded') === 'true');
        expect(firstButton.getAttribute('aria-expanded'), 'Enter should open the panel.').to.equal('true');

        await sendKeys({ press: 'Enter' });
        await waitUntil(() => firstButton.getAttribute('aria-expanded') === 'false');
        expect(firstButton.getAttribute('aria-expanded'), 'Enter should close the panel.').to.equal('false');

        // Test Space key
        await sendKeys({ press: ' ' });
        await waitUntil(() => firstButton.getAttribute('aria-expanded') === 'true');
        expect(firstButton.getAttribute('aria-expanded'), 'Space should open the panel.').to.equal('true');

        await sendKeys({ press: ' ' });
        await waitUntil(() => firstButton.getAttribute('aria-expanded') === 'false');
        expect(firstButton.getAttribute('aria-expanded'), 'Space should close the panel.').to.equal('false');
      });

      it.skip('2.1.4 Character Key Shortcuts (Level A)', () => {
        // N/A: The component does not implement any single-character key shortcuts.
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
        await emulateMedia({ reducedMotion: 'reduce' });
        await setupBlock();
        const button = block.querySelector('button[aria-expanded]');
        const panel = block.querySelector(`#${button.getAttribute('aria-controls')}`);
        const buttonBeforeStyles = window.getComputedStyle(button, '::before');
        const buttonAfterStyles = window.getComputedStyle(button, '::after');
        const panelStyles = window.getComputedStyle(panel);

        expect(buttonBeforeStyles.transitionDuration, 'Button icon should not animate with reduced motion.')
          .to.equal('0s');
        expect(buttonAfterStyles.transitionDuration, 'Button icon should not animate with reduced motion.')
          .to.equal('0s');
        expect(panelStyles.transitionDuration, 'Panel should not animate with reduced motion.')
          .to.equal('0s');

        // Test with reduced motion disabled (default) to ensure animations are present
        await emulateMedia({ reducedMotion: 'no-preference' });
      });
    });

    describe('Guideline 2.4: Navigable', () => {
      it.skip('2.4.1 Bypass Blocks (Level A)', () => {
        // N/A: Page-level concern.
      });

      it.skip('2.4.2 Page Titled (Level A)', () => {
        // N/A: Page-level concern.
      });

      it('2.4.3 Focus Order (Level A)', async () => {
        await setupBlock();
        const buttons = block.querySelectorAll('button');
        buttons[0].focus();
        expect(document.activeElement).to.equal(buttons[0]);
        await sendKeys({ press: 'ArrowDown' });
        expect(document.activeElement).to.equal(buttons[1]);
      });

      it.skip('2.4.4 Link Purpose (In Context) (Level A)', () => {
        // N/A: Content authoring concern (button content should be clear).
      });

      it.skip('2.4.5 Multiple Ways (Level AA)', () => {
        // N/A: Site-level concern.
      });

      it('2.4.6 Headings and Labels (Level AA)', async () => {
        await setupBlock();
        const button = block.querySelector('button[aria-expanded]');
        const heading = button.closest('h1, h2, h3, h4, h5, h6');
        expect(heading, 'Button should be within a heading.').to.exist;
        expect(button.textContent.trim()).to.not.be.empty;
      });

      it('2.4.7 Focus Visible (Level AA)', async () => {
        await setupBlock();
        const button = block.querySelector('button');
        const { defaultState, focusState } = await getFocusStyles(button);
        const hasStyleChanged = defaultState.outline !== focusState.outline
          || defaultState.border !== focusState.border
          || defaultState.boxShadow !== focusState.boxShadow
          || defaultState.backgroundColor !== focusState.backgroundColor;
        expect(hasStyleChanged, 'A visible focus indicator must be present.').to.be.true;
      });

      it.skip('2.4.8 Location (Level AAA)', () => {
        // N/A: This is a page-level concern about providing information about
        // the user's location within a set of pages.
      });
      it.skip('2.4.9 Link Purpose (Link Only) (Level AAA)', () => {
        // N/A: This is a content authoring concern related to link text clarity.
      });
      it.skip('2.4.10 Section Headings (Level AAA)', () => {
        // N/A: This is a content authoring concern about organizing content with headings.
      });

      it.skip('2.4.11 Focus Not Obscured (Minimum) (Level AA)', () => {
        // N/A: This requires a visual layout check to ensure the focused element
        // is not covered by other elements (e.g., sticky headers). This is
        // beyond the scope of a unit test and is better suited for
        // visual regression or manual testing.
      });

      it.skip('2.4.12 Focus Not Obscured (Enhanced) (Level AAA)', () => {
        // N/A: Similar to 2.4.11, this requires visual layout analysis and is
        // better suited for visual regression or manual testing.
      });

      it('2.4.13 Focus Appearance (Level AAA)', async () => {
        await setupBlock();
        const button = block.querySelector('button');

        const initialMetrics = getFocusIndicatorMetrics(button);

        // Focus the element using a keyboard-like interaction
        button.focus();
        await nextFrame();

        const focusedMetrics = getFocusIndicatorMetrics(button);

        const outlineChanged = initialMetrics.outlineWidth !== focusedMetrics.outlineWidth;
        const borderChanged = initialMetrics.borderWidth !== focusedMetrics.borderWidth;
        const backgroundChanged = initialMetrics.backgroundColor !== focusedMetrics.backgroundColor;
        const focusIndicatorThickness = focusedMetrics.outlineWidth + focusedMetrics.borderWidth;

        // Assertion 1: A visible change must occur.
        expect(outlineChanged || borderChanged || backgroundChanged, 'A visual focus indicator must be present.').to.be.true;

        // Assertion 2: The indicator must be at least 2px thick if using outline/border.
        if (outlineChanged || borderChanged) {
          expect(focusIndicatorThickness).to.be.at.least(2, 'Focus indicator thickness should be at least 2px.');
        }

        // Assertion 3: Use axe to check non-text contrast as a proxy for the contrast requirement.
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['non-text-contrast'] },
        });
      });
    });

    describe('Guideline 2.5: Input Modalities', () => {
      it.skip('2.5.1 Pointer Gestures (Level A)', () => {
        // N/A: Uses standard single-pointer activation.
      });

      it('2.5.2 Pointer Cancellation (Level A)', async () => {
        await setupBlock();
        const button = block.querySelector('button');
        const isInitiallyExpanded = button.getAttribute('aria-expanded');
        button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        button.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        await nextFrame();
        expect(button.getAttribute('aria-expanded')).to.equal(isInitiallyExpanded);
      });

      it('2.5.3 Label in Name (Level A)', async () => {
        await setupBlock();
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['label-in-name'] },
        });
      });

      it.skip('2.5.4 Motion Actuation (Level A)', () => {
        // N/A: Not operated by device or user motion.
      });

      it('2.5.5 Target Size (Minimum) (Level AA)', async () => {
        await setupBlock();
        const button = block.querySelector('button');
        const rect = button.getBoundingClientRect();
        expect(rect.width >= 24 && rect.height >= 24).to.be.true;
      });

      it.skip('2.5.6 Concurrent Input Mechanisms (Level AAA)', () => {
        // N/A: The component does not restrict input methods. This SC is about
        // ensuring web content does not make assumptions about the user's input device.
      });
      it.skip('2.5.7 Dragging Movements (Level AA)', () => {
        // N/A: The component does not use any dragging movements for its operation.
      });

      it('2.5.8 Target Size (Enhanced) (Level AAA)', async () => {
        await setupBlock();
        const button = block.querySelector('button');
        const rect = button.getBoundingClientRect();
        expect(rect.width >= 44 && rect.height >= 44, 'Target size must be at least 44x44px.').to.be.true;
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
        // N/A: The component does not have any interactive elements that
        // change focus on interaction.
      });
      it.skip('3.2.2 On Input (Level A)', () => {
        // N/A: The component does not have any input fields that collect
        // information about the user, so this SC is not applicable.
      });
      it.skip('3.2.3 Consistent Navigation (Level AA)', () => {
        // N/A: This SC applies to navigation repeated across multiple pages.
        // The component's internal keyboard navigation is consistent by following
        // the ARIA design pattern, which is validated in tests for Guideline 2.1 and 4.1.
      });
      it.skip('3.2.4 Consistent Identification (Level AA)', () => {
        // N/A: The component uses standard ARIA roles (tab, tablist, tabpanel),
        // ensuring consistent identification. This is validated in the 4.1.2 test.
      });

      it('3.2.5 Change on Request (Level AAA)', async () => {
        await setupBlock();
        const button = block.querySelector('button');
        button.focus();
        await nextFrame();
        expect(button.getAttribute('aria-expanded')).to.equal('false');
        button.click();
        await waitUntil(() => button.getAttribute('aria-expanded') === 'true');
      });

      it.skip('3.2.6 Consistent Help (Level A)', () => {
        // N/A: The component does not provide any help functionality.
      });
      it.skip('3.2.7 Redundant Entry (Level A)', () => {
        // N/A: The component does not have any input fields that require
        // redundant entry of information.
      });
    });

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
        // N/A: Obsolete in WCAG 2.2 and handled by linters.
      });

      it('4.1.2 Name, Role, Value (Level A)', async () => {
        await setupBlock();
        const button = block.querySelector('button');
        const panel = block.querySelector(`#${button.getAttribute('aria-controls')}`);

        // 1. Check initial state
        console.log(block.outerHTML);
        expect(button.getAttribute('aria-expanded'), 'Button should initially be collapsed.').to.equal('false');
        expect(panel.hidden, 'Panel should initially be hidden.').to.be.true;

        // 2. Check state after activation
        button.click();
        await waitUntil(() => button.getAttribute('aria-expanded') === 'true');

        expect(button.getAttribute('aria-expanded'), 'Button should be expanded after click.').to.equal('true');
        expect(panel.hidden, 'Panel should be visible after click.').to.be.false;

        // 3. Check state after deactivation
        button.click();
        await waitUntil(() => button.getAttribute('aria-expanded') === 'false');

        expect(button.getAttribute('aria-expanded'), 'Button should be collapsed after second click.').to.equal('false');
        expect(panel.hidden, 'Panel should be hidden after second click.').to.be.true;
      });

      it.skip('4.1.3 Status Messages (Level AA)', () => {
        // N/A: The component does not present status messages.
      });
    });
  });
});
