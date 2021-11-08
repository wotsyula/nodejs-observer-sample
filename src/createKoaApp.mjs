import Application from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import createKoaConfig from '../config/koa.mjs';

/**
 * Creates middleware to handle CORS headers
 *
 * @see https://github.com/koajs/cors
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 * @returns {(context) => any} `koa-js` middleware
 */
const createCORSMiddleware = () => {
  const corsOptions = {};
  return cors(corsOptions);
};

/**
 * Creates middleware to handle parseing JSON body.
 *
 * @see https://github.com/koajs/bodyparser
 * @returns {(context) => any} `koa-js` middleware
 */
const createBodyParserMiddleware = () => {
  const bodyParserOptions = {
    enableTypes: ['json'], // only allow json
    jsonLimit: '4kb', // limit size to 4kb
    strict: true, // accept only objects / arrays
  };
  return bodyParser(bodyParserOptions);
};

/**
 * Normalize a port into a number, string, or false.
 *
 * @param {(string|number)} val Port to normalize.
 * @returns {(number|string|false)} Depending on whether the port is a number, socket or something else
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val.trim();
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
};

/**
 * Creates a `koa-js` application that can act as a REST server.
 *
 * @async
 * @param {(string|number)} port Port/Socket to bind to. Default: `3000`
 * @param {string} hostname Hostname to bind to. Default: `0.0.0.0`
 * @returns {app:import('koa')} `koa-js` application
 */
export default async (port = 3000, hostname = '0.0.0.0') => {
  const config = await createKoaConfig();
  const app = new Application(config);
  const corsMiddleware = createCORSMiddleware();
  const bodyParserMiddleware = createBodyParserMiddleware();
  app.use(corsMiddleware);
  app.use(bodyParserMiddleware);

  const normalizedPort = normalizePort(port);
  const server = app.listen(normalizedPort, hostname);
  server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.debug('Listening on ' + bind);
  });

  return app;
};
