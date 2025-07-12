/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
import { nextFrame } from '@open-wc/testing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { sendKeys } from '@web/test-runner-commands';

if (window.axe) {
  window.axe.configure({
    runOnly: {
      type: 'tag',
      values: ['wcag22aaa', 'best-practice'],
    },
  });
}

/**
 * Helper function to load a component's CSS file into the test environment.
 * @param {string} href The path to the CSS file.
 * @returns {Promise<void>}
 */
export function loadComponentCSS(href) {
  return new Promise((resolve, reject) => {
    // Avoid re-injecting the same stylesheet
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = (err) => reject(new Error(`Failed to load CSS: ${href}`, { cause: err }));
    document.head.appendChild(link);
  });
}

/**
 * Captures the computed styles of an element before and after it receives focus
 * via keyboard-like interaction to correctly trigger :focus-visible.
 * This is useful for testing focus visibility.
 * @param {HTMLElement} element The element to capture focus styles from.
 * @return {Promise<{defaultState: CSSStyleDeclaration, focusState: CSSStyleDeclaration}>}
 */
export async function getFocusStyles(element) {
  const defaultStyles = window.getComputedStyle(element);
  const defaultState = {
    outline: defaultStyles.getPropertyValue('outline'),
    border: defaultStyles.getPropertyValue('border'),
    boxShadow: defaultStyles.getPropertyValue('box-shadow'),
    backgroundColor: defaultStyles.getPropertyValue('background-color'),
  };

  // Find and focus a static, pre-existing element in the fixture.
  const preFocusElement = document.getElementById('pre-focus-button');
  if (!preFocusElement) {
    throw new Error('getFocusStyles requires a #pre-focus-button element in the test fixture.');
  }
  preFocusElement.focus();
  await nextFrame();

  // Simulate a Tab key press to move focus to the target element.
  await sendKeys({ press: 'Tab' });
  await nextFrame();

  const focusStyles = window.getComputedStyle(element);
  const focusState = {
    outline: focusStyles.getPropertyValue('outline'),
    border: focusStyles.getPropertyValue('border'),
    boxShadow: focusStyles.getPropertyValue('box-shadow'),
    backgroundColor: focusStyles.getPropertyValue('background-color'),
  };

  element.blur();
  await nextFrame();

  return { defaultState, focusState };
}

/**
 * Extracts key CSS properties related to focus indicators (outline, border, background).
 * @param {HTMLElement} element The element to measure.
 * @return {{
 *   outlineWidth: number,
 *   borderWidth: number,
 *   outlineColor: string,
 *   borderColor: string,
 *   backgroundColor: string
 * }}
 */
export function getFocusIndicatorMetrics(element) {
  const styles = window.getComputedStyle(element);
  const outlineWidth = parseFloat(styles.outlineWidth) || 0;
  const borderWidth = Math.max(
    parseFloat(styles.borderTopWidth) || 0,
    parseFloat(styles.borderRightWidth) || 0,
    parseFloat(styles.borderBottomWidth) || 0,
    parseFloat(styles.borderLeftWidth) || 0,
  );
  const { outlineColor, borderColor, backgroundColor } = styles;

  return {
    outlineWidth,
    borderWidth,
    outlineColor,
    borderColor,
    backgroundColor,
  };
}
