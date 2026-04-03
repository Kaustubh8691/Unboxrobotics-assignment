/**
 * Holds the Socket.IO server instance after bootstrap so routes / services can emit
 * without circular imports. Set once from server.js.
 */
let ioInstance = null;

function setIo(io) {
  ioInstance = io;
}

function getIo() {
  return ioInstance;
}

/**
 * Broadcasts a new reading to all connected clients.
 */
function emitSpeedUpdate(payload) {
  const io = getIo();
  if (io) {
    io.emit('speed_update', payload);
  }
}

module.exports = { setIo, getIo, emitSpeedUpdate };
