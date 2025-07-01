import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: [
    'tests/test-helpers.js',
    'tests/**/*.test.js',
  ],
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    include: [
      'blocks/**/*.js',
      'scripts/scripts.js',
    ],
    threshold: {
      statements: 60,
      branches: 70,
      functions: 55,
      lines: 60,
    },
  },
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
  ],
  appIndex: 'tests/fixtures/tabs.html',
};
