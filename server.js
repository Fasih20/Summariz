const { PeerServer } = require('peer');

const PORT = process.env.PORT || 9000;
const HOST = process.env.HOST || '0.0.0.0';

const peerServer = PeerServer({
  port: PORT,
  host: HOST,
  path: '/peer',
  proxied: true,
  allow_discovery: true,
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined,
  concurrent_limit: 5000,
  alive_timeout: 60000,
});

peerServer.on('connection', (client) => {
  console.log(`🔗 New client connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`❌ Client disconnected: ${client.getId()}`);
});

console.log(`✅ PeerJS server running on ${HOST}:${PORT}/peer`);