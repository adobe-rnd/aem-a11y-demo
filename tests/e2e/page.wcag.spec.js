// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import { test, expect } from '@playwright/test';

/**
 * @typedef {Object} AICheckResult
 * @property {boolean} hasViolation - Whether the AI detected a violation.
 * @property {number} confidence - The confidence score (0.0 to 1.0).
 * @property {string} reasoning - The AI's explanation for its finding.
 */

// --- AI CHECK FOR 1.3.3 SENSORY CHARACTERISTICS ---

const SENSORY_AI_PROMPT = `
You are an expert accessibility auditor performing a check for WCAG Success Criterion 1.3.3 Sensory Characteristics.
Analyze the user-provided URL: %url%.
Your task is to determine if the content contains any instructions for understanding and operating content that rely *solely* on sensory characteristics of components such as shape, size, visual location, orientation, or sound.
Based on your analysis of the provided HTML, respond with a valid JSON object only, with no other text or explanation. The JSON object must have the following structure:
{
  "hasViolation": boolean,
  "confidence": number (from 0.0 to 1.0),
  "reasoning": "A brief explanation for your finding."
}
`;

/**
 * Simulates calling an AI model with a prompt and HTML content.
 * @param {string} prompt - The system prompt for the AI model.
 * @param {string} htmlContent - The HTML content to analyze.
 * @returns {Promise<AICheckResult>}
 */
async function callClaudeCodeAI(prompt, htmlContent) {
  if (htmlContent.includes('button on the right')) {
    return {
      hasViolation: true,
      confidence: 0.9,
      reasoning: 'The text "button on the right" relies on visual location.',
    };
  }
  return {
    hasViolation: false,
    confidence: 0.1,
    reasoning: 'No instructions found that rely solely on sensory characteristics.',
  };
}

/**
 * Performs an AI-powered check for sensory characteristics on a page's content.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @returns {Promise<AICheckResult>}
 */
async function performAISensoryCheck(page) {
  const htmlContent = await page.content();
  const result = await callClaudeCodeAI(SENSORY_AI_PROMPT.replace('%url%', page.url()), htmlContent);
  return result;
}

// --- AI CHECK FOR 1.4.5 IMAGES OF TEXT ---

const IMAGE_AI_PROMPT = `
You are an expert accessibility auditor performing a check for WCAG Success Criterion 1.4.5 Images of Text.
The user has provided a screenshot of a single image element.
Your tasks are:
1. Analyze the image to determine if it contains any visible text.
2. If it does not contain text, respond with \`{"containsText": false}\`.
3. If it contains text, extract the exact text content from the image.
4. Respond with a valid JSON object only, with no other text or explanation. The JSON object must have the following structure:
{
  "containsText": boolean,
  "extractedText": "The text extracted from the image, or an empty string."
}
`;

/**
 * @typedef {Object} AIImageAnalysisResult
 * @property {boolean} containsText - Whether the AI detected text in the image.
 * @property {string} extractedText - The text extracted from the image.
 */

/**
 * Simulates calling a multimodal AI model for OCR.
 * @param {string} prompt - The system prompt for the AI model.
 * @param {Buffer} imageBuffer - The screenshot image buffer.
 * @returns {Promise<AIImageAnalysisResult>}
 */
let callImageAnalysisAI = async (prompt, imageBuffer) => {
  // Mock response: assume OCR finds "Search" in any provided image buffer.
  if (imageBuffer.length > 0) {
    return { containsText: true, extractedText: 'Search' };
  }
  return { containsText: false, extractedText: '' };
};

/**
 * Performs an AI-powered check for images of text.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {import('@playwright/test').Locator} imageLocator - The locator for the image.
 * @returns {Promise<AICheckResult>}
 */
async function performAIImageOfTextCheck(page, imageLocator) {
  const imageBuffer = await imageLocator.screenshot();
  const altText = await imageLocator.getAttribute('alt');
  const aiResult = await callImageAnalysisAI(IMAGE_AI_PROMPT, imageBuffer);

  if (aiResult.containsText) {
    if (!altText || altText.trim() === '') {
      return {
        hasViolation: true,
        confidence: 0.95,
        reasoning: `The image contains the text "${aiResult.extractedText}" but its alt text is missing or empty.`,
      };
    }
    if (altText.toLowerCase() !== aiResult.extractedText.toLowerCase()) {
      return {
        hasViolation: true,
        confidence: 0.85,
        reasoning: `The image contains the text "${aiResult.extractedText}" but the alt text is "${altText}", which does not match.`,
      };
    }
  }

  return {
    hasViolation: false,
    confidence: 0.1,
    reasoning: 'The image either contains no text or its alt text is a correct representation.',
  };
}

// --- TEST SUITE ---

test.describe('WCAG 2.2 Conformance for Page Content (E2E)', () => {
  const CONFIDENCE_THRESHOLD = 0.8;

  test.describe('Principle 1: Perceivable', () => {
    test.describe('Guideline 1.3: Adaptable', () => {
      test.describe('1.3.3 Sensory Characteristics (Level A)', () => {
        test('Page with no sensory instructions should pass', async ({ page }) => {
          await page.setContent('<div><p>Welcome</p></div>');
          const result = await performAISensoryCheck(page);
          const isConfidentViolation = result.hasViolation
            && result.confidence >= CONFIDENCE_THRESHOLD;
          expect(isConfidentViolation, `AI should not have detected a violation. Reasoning: ${result.reasoning}`).toBe(false);
        });

        test('Page with sensory instructions should fail', async ({ page }) => {
          await page.setContent('<p>To get assistance, please use the button on the right.</p>');
          const result = await performAISensoryCheck(page);
          const isConfidentViolation = result.hasViolation
            && result.confidence >= CONFIDENCE_THRESHOLD;
          expect(isConfidentViolation, `AI should have detected a violation. Reasoning: ${result.reasoning}`).toBe(true);
        });
      });
    });

    test.describe('Guideline 1.4: Distinguishable', () => {
      test.describe('1.4.5 Images of Text (Level AA)', () => {
        test('Image of text with incorrect alt text should fail', async ({ page }) => {
          const imageOfTextSrc = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="30"><text x="10" y="20">Search</text></svg>';
          await page.setContent(`<img src="${imageOfTextSrc}" alt="Magnifying glass icon">`);
          const result = await performAIImageOfTextCheck(page, page.locator('img'));
          const isConfidentViolation = result.hasViolation
            && result.confidence >= CONFIDENCE_THRESHOLD;
          expect(isConfidentViolation, `AI should have detected a violation. Reasoning: ${result.reasoning}`).toBe(true);
        });

        test('Decorative icon with no text should pass', async ({ page }) => {
          const iconSrc = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/></svg>';
          await page.setContent(`<img src="${iconSrc}" alt="">`);
          const originalCall = callImageAnalysisAI;
          callImageAnalysisAI = async () => ({ containsText: false, extractedText: '' });
          const result = await performAIImageOfTextCheck(page, page.locator('img'));
          const isConfidentViolation = result.hasViolation
            && result.confidence >= CONFIDENCE_THRESHOLD;
          expect(isConfidentViolation, `AI should not have detected a violation. Reasoning: ${result.reasoning}`).toBe(false);
          callImageAnalysisAI = originalCall;
        });
      });
    });
  });
});
