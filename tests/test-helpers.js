/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
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
