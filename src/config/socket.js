import { io } from 'socket.io-client';
import { apiUrl } from './api.js';

// Get the base URL for Socket.io (same as API URL but without /api)
const getSocketUrl = () => {
  try {
    const apiBaseUrl = apiUrl('');
    // Remove trailing slash and /api if present
    let socketUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    // Ensure no trailing slash
    socketUrl = socketUrl.replace(/\/$/, '');
    return socketUrl;
  } catch (error) {
    // Fallback to localhost if API URL is not configured
    return 'http://localhost:3000';
  }
};

// Lazy-loaded socket instance - only created when accessed
let socket = null;

// Get or create socket instance (lazy initialization)
function getSocket() {
  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      withCredentials: true,
      // Suppress connection errors in console when backend is not available
      autoConnect: true
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
    });

    // Suppress connection errors - they're expected when backend is not running
    socket.on('connect_error', (error) => {
      // Silently handle - backend might not be running
      // Only log in development mode if needed for debugging
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_SOCKET) {
        console.warn('Socket.io connection error (backend may not be running):', error.message);
      }
    });
  }
  return socket;
}

// Export getSocket function
export { getSocket };

// Default export - lazy initialization via Proxy
// This allows components to use socket.connected, socket.on(), etc. without
// immediately creating the connection when the module is imported
export default new Proxy({}, {
  get(target, prop) {
    const socketInstance = getSocket();
    const value = socketInstance[prop];
    // If it's a function, bind it to the socket instance
    if (typeof value === 'function') {
      return value.bind(socketInstance);
    }
    return value;
  }
});

