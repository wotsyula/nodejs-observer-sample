import { freemem, totalmem } from 'os';
import Router from '@koa/router';
import createKoaApp from './createKoaApp.mjs';
import PublishQueue from '../src/PublishQueue/index.mjs';

/**
 * Creates a success response (200).
 *
 * @returns {any} JSON:API response
 */
const success = (data = null) => {
  return { data };
};

/**
 * Creates a bad request response (400).
 *
 * @returns {any} JSON:API response
 */
const badRequest = (code = 'BAD_REQUEST') => {
  return {
    errors: { status: 400, code },
  };
};

/**
 * Creates an error response (500).
 *
 * @returns {any} JSON:API response
 */
const error = (error = new Error('unknown')) => {
  return {
    errors: { status: 500, code: error.name },
  };
};

const publishQueue = new PublishQueue();
let publishCount = 0;

/**
 * Calculates the number of calls to `publish` since last call.
 *
 * @returns {number} Number of publish events since last call
 */
const getPublishCount = () => {
  const result = publishCount;
  publishCount = 0;
  return result;
};

/**
 * Sends data to subscribers.
 *
 * @param topic Topic to publish
 * @param data Data to send to subscribers
 * @returns {any} JSON:API response
 */
export const publish = async (topic, data) => {
  publishCount++;
  try {
    const result = await publishQueue.publish(topic, data);
    return result >= 0
      ? success({ id: result, type: 'publish', topic, data })
      : badRequest(result);
  } catch (e) {
    return error(e);
  }
};

let subscribeCount = 0;

/**
 * Calculates the number of calls to `subscribe` since last call.
 *
 * @returns {number} Number of subsribe events since last call
 */
const getSubscribeCount = () => {
  const result = subscribeCount;
  subscribeCount = 0;
  return result;
};

/**
 * Subscribes a URI to recieve `publish` events.
 *
 * @param {string} topic Topic to subscribe to
 * @param {string} url URI to send publish events to
 * @returns {any} JSON:API response
 */
export const subscribe = async (topic, url) => {
  subscribeCount++;
  try {
    const result = await publishQueue.subscribe(topic, url);
    return result >= 0
      ? success({ type: 'subscribe', id: result, topic, url })
      : badRequest(result);
  } catch (e) {
    return error(e);
  }
};

export default async (port, hostname, prefix = '') => {
  const app = await createKoaApp(port, hostname);
  const routerOpts = {
    prefix,
  };
  const router = new Router(routerOpts);
  router.get('/heartbeat', async (ctx, next) => {
    ctx.body = success({
      type: 'heartbeat',
      id: Date.now(),
      memory: Math.floor(freemem() / totalmem() * 100),
      publications: getPublishCount(),
      subscriptions: getSubscribeCount(),
    });
    next();
  });

  router.post('/subscribe/:topic', async (ctx, next) => {
    if (ctx.request.body?.url && ctx.params.topic) {
      ctx.body = await subscribe(ctx.params.topic, ctx.request.body.url);
    } else {
      ctx.body = badRequest();
    }
    next();
  });

  router.post('/publish/:topic', async (ctx, next) => {
    if (ctx.request.body && ctx.params.topic) {
      ctx.body = await publish(ctx.params.topic, ctx.request.body);
    } else {
      ctx.body = badRequest();
    }
    next();
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
};
