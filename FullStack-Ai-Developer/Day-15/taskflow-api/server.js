import "dotenv/config";
import { createApp } from "./src/app.js";

const PORT = process.env.PORT || 3000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`TaskFlow API running at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("TaskFlow API server closed");
    process.exit(0);
  });
});