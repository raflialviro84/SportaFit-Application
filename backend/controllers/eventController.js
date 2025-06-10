// server/controllers/eventController.js
let clients = []; // Stores active SSE client connections (response objects)

/**
 * Sends an event (data) to all connected SSE clients.
 * @param {Object} data - The data to send to the clients.
 */
const sendEventToAllClients = (data) => {
  console.log(`Broadcasting event to ${clients.length} client(s):`, data);
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

/**
 * Handles new client subscriptions to SSE.
 */
const subscribeToEvents = (req, res) => {
  console.log('SSE handler called, preparing to open connection...');
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust for your frontend's origin in production
    res.flushHeaders(); // Important to send headers immediately

    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res: res, // Store the response object to write events
      pingInterval: null
    };
    clients.push(newClient);
    console.log(`Client ${clientId} connected for SSE. Total clients: ${clients.length}`);

    // Send a connection confirmation message (optional)
    res.write(`data: ${JSON.stringify({ type: 'SSE_CONNECTION_ESTABLISHED', clientId })}\n\n`);
    console.log(`SSE connection established for client ${clientId}`);

    // Kirim ping setiap 20 detik agar koneksi tetap hidup
    newClient.pingInterval = setInterval(() => {
      try {
        res.write(`data: {"type":"PING"}\n\n`);
      } catch (e) {
        // Ignore
      }
    }, 20000);

    // Handle client disconnection
    req.on('close', () => {
      clients = clients.filter(client => client.id !== clientId);
      if (newClient.pingInterval) clearInterval(newClient.pingInterval);
      console.log(`Client ${clientId} disconnected from SSE. Total clients: ${clients.length}`);
    });
  } catch (err) {
    console.error('Error in subscribeToEvents:', err);
    try {
      res.write(`data: ${JSON.stringify({ type: 'SSE_ERROR', message: 'Internal server error' })}\n\n`);
      res.end();
    } catch (e) {
      // Ignore
    }
  }
};

module.exports = {
  subscribeToEvents,
  sendEventToAllClients, // Export to be used by other controllers
};
