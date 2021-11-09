#!/usr/bin/env node

import cluster from 'cluster';
import os from 'os';
import createPublishServer from '../src/createPublishServer.mjs';

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} starting...`);
  const startTimeout = setTimeout(process.exit, 10000, 1);

  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    clearTimeout(startTimeout);
    console.log(`worker ${worker.process.pid} online`);
  });

  cluster.on('exit', (worker /*, code, signal */) => {
    console.log(`worker ${worker.process.pid} died`);
    // Restart the worker
    const newWorker = cluster.fork();
    console.log(`worker ${newWorker.process.pid} created`);
  });

  console.log('...done');
} else {
  createPublishServer();
}
