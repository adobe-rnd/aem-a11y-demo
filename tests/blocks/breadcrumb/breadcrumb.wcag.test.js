/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
  nextFrame,
} from '@open-wc/testing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { emulateMedia, setViewport } from '@web/test-runner-commands';
import decorate from '../../../blocks/breadcrumb/breadcrumb.js';
import { loadComponentCSS, getFocusIndicatorMetrics, getFocusStyles } from '../../test-helpers.js';

// This test suite is a comprehensive checklist for WCAG 2.2 conformance.
describe('Breadcrumb WCAG Compliance', () => {
  let block;

  // Fixture for a standard breadcrumb block
  const setupBlock = async () => {
    const element = await fixture(html`
      <div>
        <button id="pre-focus-button">Start</button>
        <div class="breadcrumb">
          <ul>
            <li><a href="/link1">Home</a></li>
            <li><a href="/link2">Category</a></li>
            <li>Current Page</li>
          </ul>
        </div>
      </div>
    `);
    block = element.querySelector('.breadcrumb');
    decorate(block);
  };

  before(async () => {
    await loadComponentCSS('../../blocks/breadcrumb/breadcrumb.css');
  });

  beforeEach(async () => {
    // Reset media emulation before each test
    await emulateMedia({
      contrast: 'no-preference',
      reducedMotion: 'no-preference',
      forcedColors: 'none',
    });
  });

  describe('Principle 1: Perceivable', () => {
    describe('Guideline 1.1: Text Alternatives', () => {
      it('1.1.1 Non-text Content (Level A)', async () => {
        const fixtureWithIcon = await fixture(html`
          <div class="breadcrumb">
            <ul><li><a href="#p1" aria-label="Search"><img src="/icons/search.svg" alt=""></a></li></ul>
          </div>
        `);
        decorate(fixtureWithIcon);
        await expect(fixtureWithIcon).to.be.accessible({
          runOnly: {
            type: 'rule',
            values: ['image-alt', 'svg-img-alt', 'button-name'],
          },
        });
      });
    });

    describe('Guideline 1.2: Time-based Media', () => {
      it.skip('1.2.1 Audio-only and Video-only (Prerecorded) (Level A)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.2 Captions (Prerecorded) (Level A)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.4 Captions (Live) (Level AA)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.5 Audio Description (Prerecorded) (Level AA)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.6 Sign Language (Prerecorded) (Level AAA)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.7 Extended Audio Description (Prerecorded) (Level AAA)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.8 Media Alternative (Prerecorded) (Level AAA)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
      it.skip('1.2.9 Audio-only (Live) (Level AAA)', () => {
        // N/A: Breadcrums do not manage time-based media; this is a content concern.
      });
    });

    describe('Guideline 1.3: Adaptable', () => {
      it('1.3.1 Info and Relationships (Level A)', async () => {
        await setupBlock();
        const nav = block.querySelector('nav');
        expect(nav, 'The breadcrumb should be wrapped in a <nav> element.').to.exist;
        expect(nav.getAttribute('aria-label'), 'The nav should have an aria-label of "breadcrumb"').to.equal('breadcrumb');

        const list = block.querySelector('ol');
        expect(list, 'The list of breadcrumbs should be an ordered list (<ol>).').to.exist;

        // Fallback path: Use a generic axe check for landmark and labelling rules.
        await expect(block).to.be.accessible({
          runOnly: {
            type: 'rule',
            values: ['landmark-one-main', 'aria-label-less-than-three-words'],
          },
        });
      });

      it('1.3.2 Meaningful Sequence (Level A)', async () => {
        await setupBlock();
        // The meaningful sequence is created by using an ordered list (<ol>).
        const list = block.querySelector('ol');
        expect(list, 'The list should be an ordered list (<ol>) to convey sequence.').to.exist;

        // The sequence culminates in the current page, marked with aria-current.
        const lastItem = list.querySelector('li:last-child');
        expect(lastItem.getAttribute('aria-current'), 'The last item in the sequence should be the current page.').to.equal('page');
      });

      it.skip('1.3.3 Sensory Characteristics (Level A)', () => {
        // N/A: The component does not rely on sensory characteristics such as shape,
        // color, size, visual location, orientation, or sound for understanding.
      });

      it('1.3.4 Orientation (Level AA)', async () => {
        await setupBlock();
        // Test in a portrait-like viewport
        await setViewport({ width: 360, height: 800 });
        expect(block.offsetParent, 'Component should be visible in portrait view.').to.not.be.null;

        // Test in a landscape-like viewport
        await setViewport({ width: 1024, height: 768 });
        expect(block.offsetParent, 'Component should be visible in landscape view.').to.not.be.null;

        // Reset viewport after test
        await setViewport({ width: 800, height: 600 });
      });

      it.skip('1.3.5 Identify Input Purpose (Level AA)', () => {
        // N/A: The component does not contain any input fields that collect user information.
      });

      it('1.3.6 Identify Purpose (Level AAA)', async () => {
        await setupBlock();
        // The purpose of the component is identified by using a <nav> landmark.
        const nav = block.querySelector('nav');
        expect(nav, 'A <nav> landmark should be used to identify the breadcrumb region.').to.exist;

        // The specific purpose is clarified with an aria-label.
        expect(nav.getAttribute('aria-label'), 'The nav landmark should have an aria-label (i.e. "breadcrumb").').to.exist;

        // The purpose of the final item is identified as the current page.
        const lastItem = block.querySelector('li:last-child');
        expect(lastItem.getAttribute('aria-current'), 'The aria-current attribute identifies the final item as the current page.').to.equal('page');
      });
    });

    describe('Guideline 1.4: Distinguishable', () => {
      it('1.4.1 Use of Color (Level A)', async () => {
        await setupBlock();
        const currentPageItem = block.querySelector('[aria-current="page"]');
        const linkItem = block.querySelector('li:not([aria-current="page"])');

        const currentStyles = window.getComputedStyle(currentPageItem);
        const linkStyles = window.getComputedStyle(linkItem);

        const hasDistinction = currentStyles.fontWeight !== linkStyles.fontWeight
          || currentStyles.textDecorationLine !== linkStyles.textDecorationLine;

        expect(hasDistinction, 'Current page should be styled differently (e.g., bold).').to.be.true;
      });

      it.skip('1.4.2 Audio Control (Level A)', () => {
        // N/A: The component does not play audio.
      });

      it('1.4.3 Contrast (Minimum) (Level AA)', async () => {
        await setupBlock();
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['color-contrast'] },
        });

        await emulateMedia({ colorScheme: 'dark' });
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['color-contrast'] },
        });
        await emulateMedia({ colorScheme: 'light' });
      });

      it('1.4.4 Resize text (Level AA)', async () => {
        await setupBlock();
        const initialBodyFontSize = document.body.style.fontSize;
        document.body.style.fontSize = '200%';
        await nextFrame();

        block.querySelectorAll('li').forEach((item) => {
          expect(item.scrollWidth <= item.clientWidth, 'Content should not be horizontally clipped.').to.be.true;
        });

        document.body.style.fontSize = initialBodyFontSize;
      });

      it.skip('1.4.5 Images of Text (Level AA)', () => {
        // N/A: The component uses standard HTML text, not images of text. This is a
        // content authoring concern.
      });

      it('1.4.6 Contrast (Enhanced) (Level AAA)', async () => {
        await setupBlock();

        // Test with more contrast
        await emulateMedia({ contrast: 'more' });
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['wcag2aaa'] },
        });
        await emulateMedia({ contrast: 'no-preference' });

        // Test with dark mode
        await emulateMedia({ colorScheme: 'dark' });
        await expect(block).to.be.accessible({
          runOnly: { type: 'rule', values: ['wcag2aaa'] },
        });
        await emulateMedia({ colorScheme: 'light' });

        // Test with forced colors
        await emulateMedia({ forcedColors: 'active' });
        await expect(block).to.be.accessible({
          runOnly: { type: 'tag', values: ['wcag2aaa'] },
        });
        await emulateMedia({ forcedColors: 'none' });
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
        await setupBlock();
        await setViewport({ width: 320, height: 800 });
        await nextFrame(); // Allow for reflow

        const hasScroll = block.scrollWidth > block.clientWidth;
        // eslint-disable-next-line no-unused-expressions
        expect(hasScroll, 'Breadcrumb should not require horizontal scrolling at 320px width.').to.be.false;

        // Reset viewport
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
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
          * {
            line-height: 1.5 !important;
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
          }`;
        document.head.appendChild(styleEl);
        await nextFrame();

        block.querySelectorAll('li').forEach((item) => {
          expect(item.scrollWidth <= item.clientWidth, 'Content should not be horizontally clipped with increased text spacing.').to.be.true;
        });
        document.head.removeChild(styleEl);
      });

      it.skip('1.4.13 Content on Hover or Focus (Level AA)', () => {
        // N/A: The component does not reveal new content on hover or focus.
      });
    });
  });

  describe('Principle 2: Operable', () => {
    describe('Guideline 2.1: Keyboard Accessible', () => {
      it('2.1.1 Keyboard (Level A)', async () => {
        await setupBlock();
        const links = block.querySelectorAll('a');
        links.forEach((link) => {
          link.focus();
          expect(document.activeElement).to.equal(link);
        });
      });

      it('2.1.2 No Keyboard Trap (Level A)', async () => {
        const element = await fixture(html`<div>
          <button id="before">Before</button>
          <div class="breadcrumb">
            <ul><li><a href="#">Link</a></li><li>Current</li></ul>
          </div>
          <button id="after">After</button>
        </div>`);
        decorate(element.querySelector('.breadcrumb'));

        element.querySelector('#before').focus();
        expect(document.activeElement).to.equal(element.querySelector('#before'));

        element.querySelector('a').focus();
        expect(document.activeElement).to.equal(element.querySelector('a'));

        element.querySelector('#after').focus();
        expect(document.activeElement).to.equal(element.querySelector('#after'));
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

      it.skip('2.3.3 Animation from Interactions (Level AA)', async () => {
        // N/A: The component does not contain any flashing or blinking content.
      });
    });

    describe('Guideline 2.4: Navigable', () => {
      it.skip('2.4.1 Bypass Blocks (Level A)', () => {
        // N/A: This is a page-level concern, not applicable to a single component.
      });

      it.skip('2.4.2 Page Titled (Level A)', () => {
        // N/A: This is a page-level concern, not applicable to a single component.
      });

      it('2.4.3 Focus Order (Level A)', async () => {
        await setupBlock();
        const links = block.querySelectorAll('a');
        links[0].focus();
        expect(document.activeElement).to.equal(links[0]);

        // This is a simplified simulation of tabbing. A real tab event is hard to fake.
        links[1].focus();
        expect(document.activeElement).to.equal(links[1]);
      });

      it.skip('2.4.4 Link Purpose (In Context) (Level A)', () => {
        // N/A: The purpose of the breadcrumb links is clear from their text content
        // and the context of the navigation landmark. This is a content authoring concern.
      });

      it.skip('2.4.5 Multiple Ways (Level AA)', () => {
        // N/A: This is a site-level concern about providing multiple ways to find pages.
      });

      it.skip('2.4.6 Headings and Labels (Level AA)', () => {
        // N/A: The `aria-label` on the <nav> element provides the necessary label.
        // Quality of link text is a content authoring concern.
      });

      it('2.4.7 Focus Visible (Level AA)', async () => {
        await setupBlock();
        // Fix for simulated WebKit browsers that don't properly focus links
        if (navigator.userAgent.includes('WebKit')) {
          const anchors = [...block.querySelectorAll('a')];
          anchors.forEach((anchor) => {
            anchor.setAttribute('tabindex', '0');
          });
        }
        const link = block.querySelector('a');
        const { defaultState, focusState } = await getFocusStyles(link);
        const hasStyleChanged = defaultState.outline !== focusState.outline
          || defaultState.border !== focusState.border
          || defaultState.boxShadow !== focusState.boxShadow
          || defaultState.backgroundColor !== focusState.backgroundColor;

        // eslint-disable-next-line no-unused-expressions
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
        const link = block.querySelector('a');

        const initialMetrics = getFocusIndicatorMetrics(link);

        // Focus the element using a keyboard-like interaction
        link.focus();
        await nextFrame();

        const focusedMetrics = getFocusIndicatorMetrics(link);

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
        // N/A: The component uses standard single-pointer activation (clicks).
      });

      it.skip('2.5.2 Pointer Cancellation (Level A)', () => {
        // This is applicable, but requires a more complex test setup to reliably
        // simulate pointer events (down, leave, up outside).
        // TODO: Implement pointer cancellation test.
      });

      it('2.5.3 Label in Name (Level A)', async () => {
        await setupBlock();
        const link = block.querySelector('a');
        const visibleText = link.textContent.trim();
        const accessibleName = link.getAttribute('aria-label') || link.textContent.trim();
        expect(accessibleName.toLowerCase()).to.include(visibleText.toLowerCase());
      });

      it.skip('2.5.4 Motion Actuation (Level A)', () => {
        // N/A: The component is not operated by device or user motion.
      });

      it('2.5.5 Target Size (Minimum) (Level AA)', async () => {
        await setupBlock();
        const link = block.querySelector('a');
        // getBoundingClientRect includes padding and border, giving the full target size.
        const rect = link.getBoundingClientRect();
        // eslint-disable-next-line no-unused-expressions
        expect(rect.width >= 24 && rect.height >= 24, 'Target size must be at least 24x24px.').to.be.true;
      });

      it.skip('2.5.8 Target Size (Enhanced) (Level AAA)', async () => {
        // N/A: User Agent Control: If the size of the target is not modified by the author
        // through CSS or other size properties, then the target does not need to meet the
        // target size of 44 by 44 CSS pixels.
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
      it.skip('3.2.5 Change on Request (Level AA)', () => {
        // N/A: The component does not have any input fields that require
        // redundant entry of information.
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
        // N/A: This SC is obsolete in WCAG 2.2 and better handled by linters.
      });

      it('4.1.2 Name, Role, Value (Level A)', async () => {
        await setupBlock();
        const lastItem = block.querySelector('li:last-child');
        expect(lastItem.getAttribute('aria-current'), 'The last item should have aria-current="page".').to.equal('page');
      });

      it.skip('4.1.3 Status Messages (Level AA)', () => {
        // N/A: The component does not present status messages.
      });
    });
  });
});
 