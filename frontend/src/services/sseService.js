// src/services/sseService.js
// Utility for subscribing to backend SSE events (real-time booking updates)

// Selalu gunakan localhost untuk menghindari masalah CORS
const SSE_URL = 'http://uas.sekai.id:3000/api/events';

console.log("Using SSE URL:", SSE_URL);

class SSEClient {
  constructor(token) {
    this.token = token;
    this.eventSource = null;
    this.listeners = [];
  }

  connect() {
    if (this.eventSource) return;
    // Append token as query parameter for SSE authentication
    const url = this.token ? `${SSE_URL}?token=${encodeURIComponent(this.token)}` : SSE_URL;
    this.eventSource = new window.EventSource(url);
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach(fn => fn(data));
      } catch (e) {
        // Ignore parse error
      }
    };
    this.eventSource.onerror = (err) => {
      // Optionally handle error
      // Auto-reconnect is handled by browser
    };
  }

  subscribe(fn) {
    this.listeners.push(fn);
    this.connect();
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners = [];
  }
}

export default SSEClient;
