const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config/env");

let io;

function init(server) {
  io = new Server(server, {
    cors: { origin: config.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      socket.userDepartment = decoded.department || null;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.userRole}`);
    if (socket.userDepartment) {
      socket.join(`department:${socket.userDepartment}`);
    }
    socket.on("disconnect", () => {});
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = { init, getIO };
