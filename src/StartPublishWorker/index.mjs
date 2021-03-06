import { Queue, QueueScheduler, Worker } from 'bullmq';
import * as _ from '../constants.mjs';
import PublishQueue from '../PublishQueue/index.mjs';

export default class StartPublishWorker {
  // Static functions ---------------------------------------------------------

  /**
   * Factory
   *
   * @see https://docs.bullmq.io/guide/queues
   * @param {import('bullmq').QueueOptions} options Options forwarded to BullMQ
   * @returns {PublishQueue} New instance
   */
  static create (options) {
    return new StartPublishWorker(options);
  }

  // Getters / Setters  -------------------------------------------------------

  /**
   * Redis client
   *
   * @property {Promise<import('ioredis').Redis>}
   */
  get client () {
    return this._queue.client;
  }

  get count () {
    return this._queue.getJobCounts('active', 'delayed', 'waiting')
      .then((jobcounts) => {
        return jobcounts.waiting + jobcounts.active + jobcounts.delayed;
      });
  }

  // Methods ------------------------------------------------------------------

  /**
   * Constructor
   *
   * @see https://docs.bullmq.io/guide/queues
   * @param {import('bullmq').QueueOptions} options Options forwarded to BullMQ
   * @returns {void}
   */
  constructor (options = {}) {
    const opts = {
      ...PublishQueue.defaultOptions(),
      ...options,
    };

    /**
     * Prefix for redis keys
     *
     * @private
     * @property {string}
     */
    this._prefix = opts.prefix || '';

    /**
     * Que to pull `publish` events from.
     *
     * @private
     * @property {Worker}
     */
    this._worker = new Worker(_.START_PUBLISH_QUEUE, this.process.bind(this), opts);

    /**
     * Queue to create `start-publish` jobs on.
     *
     * @private
     * @property {Queue}
     */
    this._queue = new Queue(_.DO_PUBLISH_QUEUE, opts);

    /**
     * @private
     * @property {QueueScheduler}
     */
    this._queueScheduler = new QueueScheduler(_.DO_PUBLISH_QUEUE, opts);
  }

  /**
   * Destructor
   */
  async destroy () {
    await this._worker.close();
    await this._queueScheduler.close();
    await this._queue.drain(true);
    await this._queue.close();
  }

  generateSubscriberKey (topic) {
    return this._prefix + 'subscriber:endpoints:' + topic;
  }

  /**
   * Publishes data to subscribed endpoints.
   *
   * @async
   * @param {import('bullmq').Job} job Job to process.
   * @returns {import('bullmq').Job<any, string>[]} Array of jobs created
   */
  async process (job) {
    const subscriberKey = this.generateSubscriberKey(job.name);
    const client = await this.client;
    const results = [];
    // loop through subscriber endpoints
    // TODO: log endpoint fetch
    const endpoints = await client.smembers(subscriberKey);
    while (endpoints.length > 0 && this._worker.isRunning()) {
      // TODO: log batch start
      const jobs = [];
      /**
       * NOTE:
       * - Batch of 256 was gotten experimentally in order to ensure
       *   that batches execute < 500ms and 10 workers take < 500 mb
       * - This was tested with payloads 4kb in size
       */
      for (let k = 0; k < 256 && endpoints.length > 0; k++) {
        const endpoint = endpoints.pop();
        // create do-publish job
        jobs.push({
          name: job.name,
          data: { endpoint, payload: job.data },
        });
      }
      const result = await this._queue.addBulk(jobs);
      results.push(result);
      // TODO: log batch end
      job.progress = endpoints.length;
    }
    return results;
  }
}
