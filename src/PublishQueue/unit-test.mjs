import { expect } from 'chai';
import sinon from 'sinon';
import * as _ from './constants.mjs';
import PublishQueue from './index.mjs';

describe('UNIT | PubishQueue', function () {
  beforeEach(function () {
    this.queue = new PublishQueue(_.TEST_CONFIGURATION);
    sinon.spy(this.queue);
  });

  afterEach(function () {
    this.queue.destroy();
  });

  describe('create()', function () {
    it('should return a new instance of PublishQueue', function () {
      expect(PublishQueue.create()).to.be.instanceOf(PublishQueue);
    });
  });

  describe('validateTopic()', function () {
    describe('with valid arguments', function () {
      it('should return true', function () {
        _.VALID_TOPICS.forEach((topic) => {
          expect(PublishQueue.validateTopic(topic), topic).to.equal(true);
        });
      });
    });

    describe('with invalid arguments', function () {
      it('should return false', function () {
        _.INVALID_TOPICS.forEach((topic) => {
          expect(PublishQueue.validateTopic(topic), topic).to.equal(false);
        });
      });
    });
  });

  describe('validateURL()', function () {
    describe('with valid arguments', function () {
      it('should return true', function () {
        _.VALID_URLS.forEach((endpoint) => {
          expect(PublishQueue.validateURL(endpoint), endpoint).to.equal(true);
        });
      });
    });

    describe('with invalid arguments', function () {
      it('should return false', function () {
        _.INVALID_URLS.forEach((endpoint) => {
          expect(PublishQueue.validateURL(endpoint), endpoint).to.equal(false);
        });
      });
    });
  });

  describe('validateData()', function () {
    describe('with valid arguments', function () {
      it('should return true', function () {
        _.VALID_DATA.forEach((data) => {
          expect(PublishQueue.validateData(data), JSON.stringify(data)).to.equal(true);
        });
      });
    });

    describe('with invalid arguments', function () {
      it('should return false', function () {
        _.INVALID_DATA.forEach((data) => {
          expect(PublishQueue.validateData(data), JSON.stringify(data)).to.equal(false);
        });
      });
    });
  });

  describe('subscribe()', function () {
    it('should work', function () {
      expect(this.queue.subscribe(_.TEST_TOPIC, _.TEST_ENDPOINT)).to.be.ok();
    });

    it('should call validateTopic() and validateURL()', function () {
      this.queue.subscribe(_.TEST_TOPIC, _.TEST_ENDPOINT);
      expect(PublishQueue.validateTopic).called();
      expect(PublishQueue.validateTopic).calledWith(_.TEST_TOPIC);
      expect(PublishQueue.validateURL).called();
      expect(PublishQueue.validateURL).calledWith(_.TEST_TOPIC);
    });
  });

  describe('publish()', function () {
    it('should work', function () {
      expect(this.queue.publish(_.TEST_TOPIC, _.TEST_DATA)).to.be.ok();
    });

    it('should call validateTopic() and validateData()', function () {
      this.queue.subscribe(_.TEST_TOPIC, _.TEST_ENDPOINT);
      expect(PublishQueue.validateTopic).called();
      expect(PublishQueue.validateTopic).calledWith(_.TEST_TOPIC);
      expect(PublishQueue.validateData).called();
      expect(PublishQueue.validateData).calledWith(_.TEST_DATA);
    });
  });
});
