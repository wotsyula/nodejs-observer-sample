'use strict';

// This is a JavaScript-based config file containing every Mocha option plus others.
// If you need conditional logic, you might want to use this type of config,
// e.g. set options via environment variables 'process.env'.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  require: ['./config/setup-mocha.js'],
  spec: ['lib/**/*.test.js', 'src/**/*.test.js'],
  'check-leaks': true,
  'inline-diffs': true,
  jobs: 10,
  parallel: true,
  retries: 1,
  'watch-files': ['lib/**/*.js', 'src/**/*.js'],
  'watch-ignore': ['lib/vendor']
};