module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:9009/tests/fixtures/tabs.html'],
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'resource-summary:script:size': ['error', { maxKb: 5 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
