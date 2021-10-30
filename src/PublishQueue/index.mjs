import { readFileSync } from 'fs';
import { Queue, QueueScheduler } from 'bullmq';
import { Validator } from 'jsonschema';
import * as _ from './constants.mjs';

const schemaValidator = new Validator();
const schemaJSON = JSON.parse(readFileSync(_.DATA_SCHEMA_JSON));

export default class PublishQueue {
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
   * 
   */
  destroy () {
    this._queueScheduler.close();
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
   */
  static validateTopic (topic) {
    if (typeof topic === 'string') {
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
}
