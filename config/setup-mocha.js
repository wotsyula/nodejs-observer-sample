'use strict';

// Set up Chai ----------------------------------

const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiHTTP = require('chai-http');

chai.use(sinonChai);
chai.use(chaiHTTP);
