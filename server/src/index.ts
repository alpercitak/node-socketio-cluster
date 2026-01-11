import cluster from 'cluster';
import http from 'http';
import { Server } from 'socket.io';
import { setupMaster, setupWorker } from '@socket.io/sticky';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running with ${numCPUs} CPUs`);

  const httpServer = http.createServer((req: any, res: any) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // ...
  });

  // setup sticky sessions
  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection',
  });

  // setup connections between the workers
  setupPrimary();

  // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
  // Node.js < 16.0.0
  // cluster.setupMaster({
  //   serialization: 'advanced',
  // });

  // Node.js > 16.0.0
  cluster.setupPrimary({
    serialization: 'advanced',
  });

  httpServer.listen(3000);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker: any) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = http.createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  // use the cluster adapter
  io.adapter(createAdapter());

  // setup connection with the primary process
  setupWorker(io);

  io.on('connection', (socket: any) => {
    socket.emit('processId', process.pid);
  });
}
