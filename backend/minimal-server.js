const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Minimal server running',
        timestamp: new Date()
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`✅ Minimal server running on http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});
