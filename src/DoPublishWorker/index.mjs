import { Worker } from 'bullmq';
import * as _ from '../constants.mjs';
import PublishQueue from '../PublishQueue/index.mjs';
import superagent from 'superagent';

export default class DoPublishWorker {
  // Static functions ---------------------------------------------------------

  /**
   * Factory
   *
   * @see https://docs.bullmq.io/guide/queues
   * @param {import('bullmq').QueueOptions} options Options forwarded to BullMQ
   * @returns {PublishQueue} New instance
   */
  static create (options) {
    return new DoPublishWorker(options);
  }

  // Getters / Setters  -------------------------------------------------------

  /**
   * Redis client
   *
   * @property {Promise<import('ioredis').Redis>}
   */
  get client () {
    return this._worker.client;
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
     * Que to pull `d-publish` events from.
     *
     * @private
     * @property {Worker}
     */
    this._worker = new Worker(_.DO_PUBLISH_QUEUE, this.process.bind(this), opts);
  }

  /**
   * Destructor
   */
  async destroy () {
    await this._worker.close();
  }

  /**
   * Publishes data to subscribed endpoints.
   *
   * @async
   * @param {import('bullmq').Job} job Job to process.
   * @returns {number} Returns status code returned by `superagent`
   */
  async process (job) {
    if (!PublishQueue.validateTopic(job.name)) {
      throw new TypeError('Invalid topic');
    }

    if (!PublishQueue.validateURL(job.data.endpoint)) {
      throw new TypeError('Invalid subscriber');
    }

    if (!PublishQueue.validateData(job.data.payload)) {
      throw new TypeError('Invalid payload');
    }

    const topic = job.name;
    const { endpoint, payload } = job.data;
    const result = await superagent
      .post(endpoint)
      .timeout({
        response: 5000, // wait 5 seconds for server to start replying
        deadline: 30000, // allow 30 seconds for response to finish
      })
      .send({ ...payload, topic });

    return result.status;
  }
}
