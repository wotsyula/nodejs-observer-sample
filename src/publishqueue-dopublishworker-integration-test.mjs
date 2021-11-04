import nock from 'nock';
import * as _ from './constants.mjs';
import PublishQueue from './PublishQueue/index.mjs';
import StartPublishWorker from './StartPublishWorker/index.mjs';
import DoPublishWorker from './DoPublishWorker/index.mjs';

describe('INTEGRATION | PublishQueue -> DoPubishWorker', function () {
  beforeEach(async function () {
    this.timeout(10000);
    this.queue = new PublishQueue();
    this.worker1 = new StartPublishWorker();
    this.worker2 = new DoPublishWorker();
    for (let i = 0; i < 10000; i++) {
      this.server = nock('http://localhost:3000')
        .post(_.TEST_ENDPOINT_PATH + '/' + i)
        .reply(..._.TEST_ENDPOINT_200_RESULT);
      await this.queue.subscribe(_.TEST_TOPIC, _.TEST_ENDPOINT + '/' + i);
    }
  });

  afterEach(async function () {
    nock.cleanAll();
    await this.queue.destroy();
    await this.worker1.destroy();
    await this.worker2.destroy();
  });

  describe('PublishQueue.publish()', function () {
    it('should post to endpoints', async function () {
      await this.queue.publish(_.TEST_TOPIC, _.TEST_PAYLOAD);
      // wait for StartPublishWorker.proccess
      while (!this.server.isDone()) {
        await this.sleep(1000);
      }
    }).timeout(60000);
  });
});
