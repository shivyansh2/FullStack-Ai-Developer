import express from "express";
import authRoutes from "./routes/auth.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "10kb" }));

  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to TaskFlow API",
    });
  });

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "TaskFlow API is running",
      status: "healthy",
    });
  });

  app.use("/api/auth", authRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  // Centralized error handler
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON body",
      });
    }

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  });

  return app;
}