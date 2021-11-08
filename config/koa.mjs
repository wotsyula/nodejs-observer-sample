/**
 * Creates a configuration for `koa-js` server.
 *
 * @returns {any} Object to pass to `new require('koa')(config)`
 */
export default async function createKoaConfig () {
  const config = {
    proxy: true, // trust proxy headers
    keys: ['P4$$w0rd'], // keys for encrypting cookies
  };
  return config;
};
