import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

// Set up Chai ----------------------------------

chai.use(sinonChai);
chai.use(chaiHttp);

// Set up Mocha ----------------------------------

const sleep = (milliseconds) => {
  if (
    typeof milliseconds !== 'number' ||
    milliseconds < 0 ||
    milliseconds > Number.MAX_SAFE_INTEGER
  ) {
    throw new TypeError(`milliseconds must be a number 0 - ${Number.MAX_SAFE_INTEGER}`);
  }

  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export const mochaHooks = {
  beforeEach () {
    this.sleep = sleep;
    this.server = sinon.fakeServer.create();
  },

  afterEach () {
    this.server.restore();
  },
};
