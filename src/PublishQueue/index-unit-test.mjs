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
    await client.del(this.queue.generateSubscriberKey(_.TEST_TOPIC));
    await this.queue.destroy();
  });

  describe('client', function () {
    it('should return a IORedis client', async function () {
      const client = await this.queue.client;
      expect(client).to.have.property('get');
      expect(client).to.have.property('set');
      expect(client).to.have.property('del');
    });
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
      await this.queue.subscribe('foo', 'https://example.com/');
      expect(PublishQueue.validateTopic).calledWith('foo');
      expect(PublishQueue.validateURL).calledWith('https://example.com/');
    });

    it('should handle up to 100000 (100 thousand) subscribers', async function () {
      for (let i = 0; i < 100000; i++) {
        const endpoint = `${_.TEST_ENDPOINT}?id=${i}`;
        await this.queue.subscribe(_.TEST_TOPIC, endpoint);
      }
    }).timeout(60000);

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
        for (const endpoint in _.INVALID_URLS) {
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
      const data = { data: null };
      await this.queue.publish('bar', data);
      expect(PublishQueue.validateTopic).calledWith('bar');
      expect(PublishQueue.validateData).calledWith(data);
    });

    it('should increase count', async function () {
      const originalCount = await this.queue.count;
      await this.queue.publish(_.TEST_TOPIC, _.TEST_PAYLOAD);
      const result = await this.queue.count;
      expect(result).to.equal(originalCount + 1);
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
});
