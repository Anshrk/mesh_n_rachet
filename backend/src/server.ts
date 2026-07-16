import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CognitionFabric } from './fabric';
import { AutonomousObserver } from './observer';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const fabric = new CognitionFabric();
const observer = new AutonomousObserver(fabric, io);

io.on('connection', (socket) => {
  console.log('Client connected to Cognition Mesh:', socket.id);
  
  fabric.getAllInsights((insights) => {
    socket.emit('initial_state', insights);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Autonomous Control Endpoints
app.post('/api/simulation/start', (req, res) => {
  observer.start();
  res.status(200).json({ message: 'Autonomous simulation started.' });
});

app.post('/api/simulation/stop', (req, res) => {
  observer.stop();
  res.status(200).json({ message: 'Autonomous simulation stopped.' });
});

app.post('/api/simulation/inject', (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'Description is required' });
  observer.injectProblem(description);
  res.status(200).json({ message: 'Custom problem injected into the mesh.' });
});

// Clear cache endpoint for live demo
app.post('/api/fabric/clear', (req, res) => {
  fabric.clearFabric(() => {
    io.emit('fabric_cleared');
    res.status(200).json({ message: 'Fabric cache wiped.' });
  });
});

// Admin endpoint for manual poison injection (Chaos testing)
app.post('/api/insights', (req, res) => {
  const insight = req.body;
  // Hardcode a fake vector for manual chaos injections so it doesn't crash similarity
  const fakeVector = new Array(768).fill(0.01); 
  const result = fabric.publishInsight(insight, fakeVector, (savedInsight) => {
    io.emit('fabric_update', savedInsight);
  });
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    io.emit('guardrail_block', { message: result.message, insight });
    res.status(403).json(result);
  }
});

// Manual Semantic Search endpoint
import { generateEmbedding } from './ai';
app.post('/api/fabric/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const queryVector = await generateEmbedding(query);
    // We pass 0.0 as threshold because we want to see the highest match regardless of score
    fabric.findSemanticMatch(queryVector, 0.0, (match, similarity) => {
      res.status(200).json({ match, similarity });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search semantic space' });
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Cognition Fabric API running on port ${PORT}`);
});
