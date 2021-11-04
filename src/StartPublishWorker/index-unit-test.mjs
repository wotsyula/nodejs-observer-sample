import { expect } from 'chai';
import sinon from 'sinon';
import * as _ from '../constants.mjs';
import PublishQueue from '../PublishQueue/index.mjs';
import StartPublishWorker from './index.mjs';

describe('UNIT | StartPubishWorker', function () {
  beforeEach(async function () {
    this.worker = new StartPublishWorker();
    sinon.spy(this.worker);
    this.parentQueue = new PublishQueue();
    await this.parentQueue.subscribe(_.TEST_TOPIC, _.TEST_ENDPOINT);
  });

  afterEach(async function () {
    const client = await this.worker.client;
    await client.del(this.worker.generateSubscriberKey(_.TEST_TOPIC));
    await this.worker.destroy();
    await this.parentQueue.destroy();
  });

  describe('client', function () {
    it('should return a IORedis client', async function () {
      const client = await this.worker.client;
      expect(client).to.have.property('get');
      expect(client).to.have.property('set');
      expect(client).to.have.property('del');
    });
  });

  describe('create()', function () {
    it('should return a new instance of StartPublishWorker', function () {
      expect(StartPublishWorker.create()).to.be.instanceOf(StartPublishWorker);
    });
  });

  describe('process()', function () {
    it('should perform a join', async function () {
      const result = await this.worker.process(_.TEST_START_PUBLISH_JOB);
      expect(result).to.have.length(1);
    });

    it('should increase count', async function () {
      const originalCount = await this.worker.count;
      await this.worker.process(_.TEST_START_PUBLISH_JOB);
      const result = await this.worker.count;
      expect(result).to.equal(originalCount + 1);
    });

    it('should handle up to 100,000 (100 thousand) subscribers', async function () {
      for (let i = 0; i < 100000; i++) {
        await this.parentQueue.subscribe(_.TEST_TOPIC, `${_.TEST_ENDPOINT}?id=${i}`);
      }
      const result = await this.worker.process(_.TEST_START_PUBLISH_JOB);
      expect(result).to.have.length(Math.ceil(100000 / 256));
    }).timeout(60000);
  });
});
