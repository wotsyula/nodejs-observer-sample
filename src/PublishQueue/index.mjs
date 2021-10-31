import { readFileSync } from 'fs';
import { Queue, QueueScheduler } from 'bullmq';
import { Validator } from 'jsonschema';
import * as _ from '../constants.mjs';

const schemaValidator = new Validator();
const schemaJSON = JSON.parse(readFileSync(_.DATA_SCHEMA_JSON));

export default class PublishQueue {
  // Static functions ---------------------------------------------------------

  /**
   * Generates default options
   *
   * @static
   * @returns {import('bullmq').QueueOptions}
   */
  static defaultOptions () {
    return _.DEFAULT_QUEUE_OPTIONS;
  }

  /**
   * Factory
   *
   * @see https://docs.bullmq.io/guide/queues
   * @param {import('bullmq').QueueOptions} options Options forwarded to BullMQ
   * @returns {PublishQueue} New instance
   */
  static create (options) {
    return new PublishQueue(options);
  }

  /**
   * Validates a topic passed to `subscribe()` and `publish()`.
   *
   * @example
   * ```
   * validateTopic('this-is-correct'); // true
   * validateTopic('correct'); // true
   * validateTopic('this--is--not--correct'); // false
   * validateTopic('this-is-not-correct-'); // false
   * ```
   * @static
   * @param {string} topic Topic to validate
   * @returns {boolean} `true` if topic is a lower case string with words separated by dashes and `false` otherwise
   *                    `false` if topic contains more than 31 characters
   */
  static validateTopic (topic) {
    if (typeof topic === 'string' && topic.length < 32) {
      if (topic.match(_.SLUG_RE)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Validates URI protocol for `endpoint` passed to `validateURL()`.
   *
   * @param {string} protocol Protocol to validate
   * @returns {boolean} `true` if protocol is a valid protocol and `false` otherwise
   */
  static validateProtocol (protocol) {
    return protocol === 'http:' || protocol === 'https:';
  }

  /**
   * Validates an endpoint URI passed to `subscribe()`.
   *
   * @param {string} endpoint URI to validate
   * @returns {boolean} `true` if `endpoint` is a string that points to a HTTP or HTTPS address and `false` otherwise.
   *                    `false` if `endpoint` contains a URI fragment
   */
  static validateURL (endpoint) {
    if (typeof endpoint === 'string') {
      try {
        const parsedURL = new URL(endpoint);
        return (
          PublishQueue.validateProtocol(parsedURL.protocol) &&
          !parsedURL.hash
        );
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * Validates object as following JSON:API standard.
   *
   * @see https://jsonapi.org/
   * @param {any} object Object to validate
   * @returns {boolean} `true` if object keys / values follow JSON:API standard and `false` otherwise
   */
  static validateData (object) {
    const result = schemaValidator.validate(object, schemaJSON);
    return result.valid;
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
        console.log(jobcounts);
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
     * @private
     * @property {Queue}
     */
    this._queue = new Queue(_.PUBLISH_QUEUE, opts);

    /**
     * @private
     * @property {QueueScheduler}
     */
    this._queueScheduler = new QueueScheduler(_.PUBLISH_QUEUE, opts);
  }

  /**
   * Destructor
   */
  async destroy () {
    await this._queue.clean(0);
    await this._queueScheduler.close();
    await this._queue.close();
  }

  generateSubscriberKey (topic) {
    return this._prefix + 'topic_' + topic;
  }

  /**
   * Subscribes an endpoint to recieve publish posts.
   *
   * @async
   * @param {string} topic Topic to subscribe to
   * @param {string} endpoint URI of endpoint to send publish events
   * @returns {integer} number of items added and a negative number in case of an error
   */
  async subscribe (topic, endpoint) {
    if (!PublishQueue.validateTopic(topic)) {
      // TODO: log error
      return _.INVALID_TOPIC_RESULT;
    }

    if (!PublishQueue.validateURL(endpoint)) {
      // TODO: log error
      return _.INVALID_ENDPOINT_RESULT;
    }

    const client = await this.client;
    const result = await client.sadd(this.generateSubscriberKey(topic), endpoint);
    return result;
  }

  /**
   * Publishes data to subscribed endpoints.
   *
   * @param {string} topic Topic to publish to
   * @param {any} payload JSON:API formatted payload
   * @returns {string} Job ID or negative number in case of an error
   */
  async publish (topic, payload) {
    if (!PublishQueue.validateTopic(topic)) {
      // TODO: log error
      return _.INVALID_TOPIC_RESULT.toString();
    }

    if (!PublishQueue.validateData(payload)) {
      // TODO: log error
      return _.INVALID_PAYLOAD_RESULT.toString();
    }

    try {
      const result = await this._queue.add(topic, payload);
      return result.id;
    } catch (e) {
      // TODO: log error
      return _.QUE_ADD_ERROR_RESULT;
    }
  }
}
