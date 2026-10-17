import { createServer } from "node:http";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store"
};

export function createApp() {
  return createServer((req, res) => {
    const sendJson = (statusCode, body) => {
      res.writeHead(statusCode, JSON_HEADERS);
      res.end(JSON.stringify(body));
    };

    console.log(`${req.method} ${req.url}`);

    if (req.method === "GET" && req.url === "/") {
      return sendJson(200, {
        success: true,
        message: "Welcome to the  API",
        version: "1.0.0"
      });
    }

    if (req.method === "GET" && req.url === "/api/health") {
      return sendJson(200, {
        success: true,
        message: " backend is running",
        status: "healthy"
      });
    }

    return sendJson(404, {
      success: false,
      message: "Route not found"
    });
  });
}
