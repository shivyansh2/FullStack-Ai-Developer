import { createApp } from "./src/app.js";

const PORT = Number(process.env.PORT) || 3000;
const server = createApp();

server.on("error", (error) => {
  console.error("Server error:", error.message);
  process.exitCode = 1;
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Comply API running at http://127.0.0.1:${PORT}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received. Closing server...`);
  server.close((error) => {
    if (error) {
      console.error("Error while closing server:", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
