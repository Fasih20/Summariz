const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 9000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);

// --- Setup PeerJS server ---
const peerServer = ExpressPeerServer(server, {
  path: '/peer',
  proxied: true,
  allow_discovery: true,
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined,
  concurrent_limit: 5000,
  alive_timeout: 60000,
});

app.use('/peer', peerServer);

peerServer.on('connection', (client) => {
  console.log(`🔗 New PeerJS client connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`❌ PeerJS client disconnected: ${client.getId()}`);
});

// --- Setup Socket.IO server ---
const io = new Server(server, {
  cors: {
    origin: '*', // Replace with your frontend domain for production
    methods: ['GET', 'POST']
  }
});

const streamTranscripts = new Map(); // streamId => Set of socket ids

io.on('connection', (socket) => {
  console.log(`🔌 New Socket.IO connection: ${socket.id}`);

  socket.on('joinStream', (streamId) => {
    socket.join(streamId);
    console.log(`📺 ${socket.id} joined stream ${streamId}`);

    if (!streamTranscripts.has(streamId)) {
      streamTranscripts.set(streamId, new Set());
    }
    streamTranscripts.get(streamId).add(socket.id);
  });

  socket.on('transcription', ({ streamId, text }) => {
    // Relay to all viewers except sender
    socket.to(streamId).emit('transcription', text);
  });

  socket.on('disconnect', () => {
    streamTranscripts.forEach((sockets, streamId) => {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        streamTranscripts.delete(streamId);
      }
    });
    console.log(`🔌 Socket.IO disconnected: ${socket.id}`);
  });
});

// --- Start server ---
server.listen(PORT, HOST, () => {
  console.log(`✅ Combined PeerJS + Socket.IO server running on http://${HOST}:${PORT}`);
});
