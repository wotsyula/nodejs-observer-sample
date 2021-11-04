import { expect } from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import * as _ from '../constants.mjs';
import StartPublishWorker from '../StartPublishWorker/index.mjs';
import DoPublishWorker from './index.mjs';

describe('UNIT | DoPubishWorker', function () {
  beforeEach(async function () {
    this.server = nock('http://localhost:3000')
      .post(_.TEST_ENDPOINT_PATH);
    this.worker = new DoPublishWorker();
    sinon.spy(this.worker);
  });

  afterEach(async function () {
    await this.worker.destroy();
    nock.cleanAll();
  });

  it('should forward messages to endpoints', async function () {
    const scope = this.server.reply(..._.TEST_ENDPOINT_200_RESULT);
    this.queue = new StartPublishWorker();
    this.queue._queue.add(_.TEST_TOPIC, { endpoint: _.TEST_ENDPOINT, payload: _.TEST_PAYLOAD });
    // wait for StartPublishWorker.proccess
    while (!scope.isDone()) {
      await this.sleep(100);
    }
  }).timeout(10000);

  describe('create()', function () {
    it('should return a new instance of StartPublishWorker', function () {
      expect(DoPublishWorker.create()).to.be.instanceOf(DoPublishWorker);
    });
  });

  describe('process()', function () {
    it('should return HTTP response code', async function () {
      const scope = this.server.reply(..._.TEST_ENDPOINT_200_RESULT);
      const result = await this.worker.process(_.TEST_DO_PUBLISH_JOB);
      expect(scope.isDone()).to.equal(true);
      expect(result).to.equal(200);
    });

    it('should throw an error with invalid data', async function () {
      const assertions = _.INVALID_DO_PUBLISH_JOBS.map((job) => {
        return expect(this.worker.process(job), JSON.stringify(job)).to.be.rejectedWith(TypeError);
      });
      return assertions;
    });

    it('should handle 5xx errors', async function () {
      const scope = this.server.reply(..._.TEST_ENDPOINT_5XX_RESULT);
      try {
        await this.worker.process(_.TEST_DO_PUBLISH_JOB);
        throw new Error('Exception expected');
      } catch (e) {
        expect(e.status).is.equal(500);
        expect(scope.isDone()).to.equal(true);
      }
    });

    it('should handle 4xx errors', async function () {
      const scope = this.server.reply(..._.TEST_ENDPOINT_4XX_RESULT);
      try {
        await this.worker.process(_.TEST_DO_PUBLISH_JOB);
        throw new Error('Exception expected');
      } catch (e) {
        expect(e.status).is.equal(404);
        expect(scope.isDone()).to.equal(true);
      }
    });

    it('should handle server timeouts', async function () {
      const scope = this.server.delay(31000).reply(..._.TEST_ENDPOINT_4XX_RESULT);
      try {
        await this.worker.process(_.TEST_DO_PUBLISH_JOB);
        throw new Error('Exception expected');
      } catch (e) {
        expect(e.code).is.equal('ECONNABORTED');
        expect(scope.isDone()).to.equal(true);
      }
    }).timeout(60000);

    it('should handle network disconnects', async function () {
      const scope = this.server.delayBody(31000).reply(..._.TEST_ENDPOINT_4XX_RESULT);
      try {
        await this.worker.process(_.TEST_DO_PUBLISH_JOB);
        throw new Error('Exception expected');
      } catch (e) {
        expect(e.code).is.equal('ECONNABORTED');
        expect(scope.isDone()).to.equal(true);
      }
    }).timeout(60000);
  });
});
