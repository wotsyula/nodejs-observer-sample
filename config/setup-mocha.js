'use strict';

// Set up Chai ----------------------------------

const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiHTTP = require('chai-http');

chai.use(sinonChai);
chai.use(chaiHTTP);

// Set up Mocha ----------------------------------

const sleep = (milliseconds) => {
  if (
    typeof milliseconds !== 'number' ||
    milliseconds < 0 ||
    milliseconds > Number.MAX_SAFE_INTEGER
  ) {
    throw new TypeError(`milliseconds must be a number 0 - ${Number.MAX_SAFE_INTEGER}`);
  }

  return new Promise((resolve, reject) => {
    setTimeout(resolve, milliseconds);
  });
};

const mochaHooks = {
  beforeEach () {
    this.sleep = sleep;
  },

  afterEach () {
    delete this.sleep;
  },
};

module.exports = { mochaHooks };
