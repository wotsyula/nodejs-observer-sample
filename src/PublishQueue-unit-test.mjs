import { expect } from 'chai';
import sinon from 'sinon';
import * as _ from './PublishQueue-constants.mjs';
import PublishQueue from './PublishQueue.mjs';

describe('UNIT | PubishQueue', function () {
  beforeEach(function () {
    this.queue = new PublishQueue(_.TEST_CONFIGURATION);
    sinon.spy(this.queue);
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
          expect(this.queue.validateTopic(topic)).to.be.true();
        });
      });
    });

    describe('with invalid arguments', function () {
      it('should return false', function () {
        _.INVALID_TOPICS.forEach((topic) => {
          expect(this.queue.validateTopic(topic)).to.be.false();
        });
      });
    });
  });

  describe('validateURL()', function () {
    describe('with valid arguments', function () {
      it('should return true', function () {
        _.VALID_URLS.forEach((topic) => {
          expect(this.queue.validateTopic(topic)).to.be.true();
        });
      });
    });

    describe('with invalid arguments', function () {
      it('should return false', function () {
        _.INVALID_URLS.forEach((topic) => {
          expect(this.queue.validateTopic(topic)).to.be.false();
        });
      });
    });
  });

  describe('validateData()', function () {
    describe('with valid arguments', function () {
      it('should return true', function () {
        _.VALID_DATA.forEach((topic) => {
          expect(this.queue.validateTopic(topic)).to.be.true();
        });
      });
    });

    describe('with invalid arguments', function () {
      it('should return false', function () {
        _.INVALID_DATA.forEach((topic) => {
          expect(this.queue.validateTopic(topic)).to.be.false();
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
      expect(this.queue.validateTopic).called();
      expect(this.queue.validateTopic).calledWith(_.TEST_TOPIC);
      expect(this.queue.validateURL).called();
      expect(this.queue.validateURL).calledWith(_.TEST_TOPIC);
    });
  });

  describe('publish()', function () {
    it('should work', function () {
      expect(this.queue.publish(_.TEST_TOPIC, _.TEST_DATA)).to.be.ok();
    });

    it('should call validateTopic() and validateData()', function () {
      this.queue.subscribe(_.TEST_TOPIC, _.TEST_ENDPOINT);
      expect(this.queue.validateTopic).called();
      expect(this.queue.validateTopic).calledWith(_.TEST_TOPIC);
      expect(this.queue.validateData).called();
      expect(this.queue.validateData).calledWith(_.TEST_DATA);
    });
  });
});
