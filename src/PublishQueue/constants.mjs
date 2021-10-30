import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const PUBLISH_QUEUE = 'publish';
/** @type {(import('bullmq').QueueOptions|import('bullmq').QueueSchedulerOptions)} */
export const DEFAULT_QUEUE_OPTIONS = {
  autorun: true,
  connection: {
    host: '0.0.0.0',
    port: 6379,
  },
  defaultJobOptions: {
    attempts: 10,
    backoff: '5s',
    removeOnComplete: 1000,
    sizeLimit: 65536, // 1024 * 64
    timeout: 300000, // 1000 * 60 * 5
  },
  prefix: 'bullmq_',
  sharedConnection: false,
};
export const SLUG_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const DATA_SCHEMA_JSON = join(dirname(fileURLToPath(import.meta.url)), 'data-schema.json');
export const INVALID_TOPIC_RESULT = -100;
export const INVALID_ENDPOINT_RESULT = -200;
export const INVALID_PAYLOAD_RESULT = -300;
export const QUE_ADD_ERROR_RESULT = -400;
export const TEST_CONFIGURATION = {};
export const TEST_TOPIC = 'test';
export const TEST_ENDPOINT = 'http://localhost:30001';
export const TEST_PAYLOAD = {
  data: {
    type: 'articles',
    id: '1',
    attributes: {
      title: 'Rails is Omakase',
    },
    relationships: {
      author: {
        links: {
          self: '/articles/1/relationships/author',
          related: '/articles/1/author',
        },
        data: { type: 'people', id: '9' },
      },
    },
  },
};
export const VALID_TOPICS = [
  TEST_TOPIC,
  'contains-dash',
  'a-edge-case-a',
];
export const INVALID_TOPICS = [
  'contains space',
  'CapitalLetters',
  'More--than--one--dash',
  'ends-in-dash-',
  'an-extreamly-looooooooooooooooooooooong-topic',
];
export const VALID_URLS = [
  TEST_ENDPOINT,
  'http://example.com',
  'http://example.com/foo/bar',
  'http://example.com?foo=bar',
];
export const INVALID_URLS = [
  'http://example.com#foo',
];
export const VALID_DATA = [
  TEST_PAYLOAD,
  {
    data: [{
      type: 'articles',
      id: '1',
      attributes: {
        title: 'JSON:API paints my bikeshed!',
        body: 'The shortest article. Ever.',
        created: '2015-05-22T14:56:29.000Z',
        updated: '2015-05-22T14:56:28.000Z',
      },
      relationships: {
        author: {
          data: { id: '42', type: 'people' },
        },
      },
    }],
    included: [
      {
        type: 'people',
        id: '42',
        attributes: {
          name: 'John',
          age: 80,
          gender: 'male',
        },
      },
    ],
  },
  {
    links: {
      self: 'http://example.com/articles',
    },
    data: [{
      type: 'articles',
      id: '1',
      attributes: {
        title: 'JSON:API paints my bikeshed!',
      },
    }, {
      type: 'articles',
      id: '2',
      attributes: {
        title: 'Rails is Omakase',
      },
    }],
  },
  {
    links: {
      self: 'http://example.com/articles',
    },
    data: [],
  },
  {
    errors: [
      {
        status: '422',
        source: { pointer: '/data/attributes/firstName' },
        title: 'Invalid Attribute',
        detail: 'First name must contain at least three characters.',
      },
    ],
  },
  {
    errors: [
      {
        status: '403',
        source: { pointer: '/data/attributes/secretPowers' },
        detail: 'Editing secret powers is not authorized on Sundays.',
      },
      {
        status: '422',
        source: { pointer: '/data/attributes/volume' },
        detail: 'Volume does not, in fact, go to 11.',
      },
      {
        status: '500',
        source: { pointer: '/data/attributes/reputation' },
        title: 'The backend responded with an error',
        detail: 'Reputation service not responding after three requests.',
      },
    ],
  },
];
export const INVALID_PAYLOADS = [
  {
    foo: 'bar',
    bar: 1,
  },
];
