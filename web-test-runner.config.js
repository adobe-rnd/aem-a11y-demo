/* eslint-disable import/no-extraneous-dependencies */
import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import rollupCommonjs from '@rollup/plugin-commonjs';
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';

const commonjs = fromRollup(rollupCommonjs);

export default {
  files: ['tests/**/*.test.js'],
  nodeResolve: true,
  plugins: [
    visualRegressionPlugin({
      baseDir: 'tests/snapshots',
      update: process.argv.includes('--update-visual-baseline'),
    }),
    esbuildPlugin({ ts: true }),
    commonjs({
      include: [
        '**/node_modules/chai-a11y-axe/**/*',
      ],
    }),
  ],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '5000',
    },
  },
  testRunnerHtml: (testFramework) => `
    <html>
      <head>
        <script type="module" src="${testFramework}"></script>
        <script type="module" src="/node_modules/axe-core/axe.min.js"></script>
      </head>
      <body></body>
    </html>
  `,
  coverage: true,
  coverageConfig: {
    include: [
      'blocks/**/*.js',
      'scripts/**/a11y-*.js',
    ],
    report: true,
    reportDir: 'coverage',
    threshold: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
