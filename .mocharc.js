'use strict';

// This is a JavaScript-based config file containing every Mocha option plus others.
// If you need conditional logic, you might want to use this type of config,
// e.g. set options via environment variables 'process.env'.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  require: ['./config/setup-mocha.cjs'],
  spec: [
    'app/**/*-test.mjs',
    'lib/**/*-test.mjs',
    'src/**/*-test.mjs',
  ],
  'check-leaks': true,
  'inline-diffs': true,
  jobs: 10,
  parallel: true,
  retries: 1,
  'watch-files': [
    'app/**/*.mjs',
    'lib/**/*.mjs',
    'src/**/*.mjs',
  ],
  'watch-ignore': ['lib/vendor'],
  "overrides": [
    {
      "files": ["*-test.mjs", "*-spec.mjs"],
      "rules": {
        "no-unused-expressions": "off",
      },
    },
  ],
};
