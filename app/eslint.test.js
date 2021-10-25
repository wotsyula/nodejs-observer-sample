const glob = require('glob');
const lint = require('mocha-eslint');
const paths = glob.sync('./+(app|config|lib|src)/**/*.js');
const options = {
  // Consider linting warnings as errors and return failure
  strict: true,
  // Increase the timeout of the test if linting takes to long
  timeout: 5000,
  // Increase the time until a test is marked as slow
  slow: 1000,
  // Specify the mocha context in which to run tests
  contextName: 'ESLint',
};

// Run the tests
lint(paths, options);
