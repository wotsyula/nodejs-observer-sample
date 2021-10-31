import { expect } from 'chai';
import sinon from 'sinon';
import * as _ from '../constants.mjs';
import PublishQueue from './index.mjs';

describe('UNIT | PubishQueue', function () {
  beforeEach(function () {
    this.queue = new PublishQueue(_.TEST_CONFIGURATION);
    sinon.spy(PublishQueue, 'validateTopic');
    sinon.spy(PublishQueue, 'validateURL');
    sinon.spy(PublishQueue, 'validateData');
  });

  afterEach(async function () {
    PublishQueue.validateTopic.restore();
    PublishQueue.validateURL.restore();
    PublishQueue.validateData.restore();
    const client = await this.queue.client;
    client.del(this.queue.generateSubscriberKey(_.TEST_TOPIC));
    await this.queue.destroy();
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
        _.INVALID_PAYLOADS.forEach((data) => {
          expect(PublishQueue.validateData(data), JSON.stringify(data)).to.equal(false);
        });
      });
    });
  });

  describe('subscribe()', function () {
    it('should work', async function () {
      const result = await this.queue.subscribe(_.TEST_TOPIC, _.TEST_ENDPOINT);
      expect(result).to.equal(1);
    });

    it('should call validateTopic() and validateURL()', async function () {
      await this.queue.subscribe(_.TEST_TOPIC, _.TEST_ENDPOINT);
      expect(PublishQueue.validateTopic).callCount(1);
      expect(PublishQueue.validateTopic).calledWith(_.TEST_TOPIC);
      expect(PublishQueue.validateURL).callCount(1);
      expect(PublishQueue.validateURL).calledWith(_.TEST_ENDPOINT);
    });

    describe('with invalid topic', function () {
      it('should return INVALID_TOPIC_RESULT', async function () {
        for (const topic in _.INVALID_TOPICS) {
          const result = await this.queue.subscribe(topic, _.TEST_ENDPOINT);
          expect(result, topic).to.equal(_.INVALID_TOPIC_RESULT);
        }
      });
    });

    describe('with invalid enpoint', function () {
      it('should return INVALID_ENDPOINT_RESULT', async function () {
        for (const endpoint in _.INVALID_ENDPOINTS) {
          const result = await this.queue.subscribe(_.TEST_TOPIC, endpoint);
          expect(result, endpoint).to.equal(_.INVALID_ENDPOINT_RESULT);
        }
      });
    });
  });

  describe('publish()', function () {
    it('should work', async function () {
      const result = await this.queue.publish(_.TEST_TOPIC, _.TEST_PAYLOAD);
      expect(result).to.be.a('string');
    });

    it('should call validateTopic() and validateData()', async function () {
      await this.queue.publish(_.TEST_TOPIC, _.TEST_PAYLOAD);
      expect(PublishQueue.validateTopic).callCount(1);
      expect(PublishQueue.validateTopic).calledWith(_.TEST_TOPIC);
      expect(PublishQueue.validateData).callCount(1);
      expect(PublishQueue.validateData).calledWith(_.TEST_PAYLOAD);
    });

    describe('with invalid topic', function () {
      it('should return INVALID_TOPIC_RESULT', async function () {
        for (const topic in _.INVALID_TOPICS) {
          const result = await this.queue.publish(topic, _.TEST_PAYLOAD);
          expect(result, topic).to.equal(_.INVALID_TOPIC_RESULT.toString());
        }
      });
    });

    describe('with invalid payload', function () {
      it('should return INVALID_PAYLOAD_RESULT', async function () {
        for (const payload in _.INVALID_PAYLOADS) {
          const result = await this.queue.publish(_.TEST_TOPIC, payload);
          expect(result, payload).to.equal(_.INVALID_PAYLOAD_RESULT.toString());
        }
      });
    });
  });

  describe('count', function () {
    it('should return the current number of jobs', async function () {
      const originalCount = await this.queue.count;
      await this.queue.publish(_.TEST_TOPIC, _.TEST_PAYLOAD);
      const result = await this.queue.count;
      expect(result).to.equal(originalCount + 1);
    });
  });
});
