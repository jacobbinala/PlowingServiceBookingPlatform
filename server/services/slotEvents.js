const clients = new Set();

function sendEvent(res, eventName, data) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function addClient(res) {
  clients.add(res);
  return () => {
    clients.delete(res);
  };
}

function broadcastAvailabilityUpdate(payload) {
  for (const res of clients) {
    try {
      sendEvent(res, 'availability', payload);
    } catch (e) {
      clients.delete(res);
    }
  }
}

module.exports = {
  addClient,
  sendEvent,
  broadcastAvailabilityUpdate
};

