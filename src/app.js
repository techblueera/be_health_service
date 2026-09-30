import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import { connectDB } from "./config/database.js";
import appLogger from "./utils/appLogger.js";
import { asciiLogger } from "./utils/asciiLogger.js";
import apiRoutes from "./routes/index.js";
import healthRoutes from "./routes/health.routes.js";
import { noStore } from "./middlewares/noStore.js";
import { seedCategories } from "./seeders/pharmacySeeder.js";
import {
  startInactivityPurgeConsumer,
  stopInactivityPurgeConsumer,
} from "./kafka/inactivityPurgeConsumer.js";
import {
  closeHttpServer,
  installShutdownHandlers,
  registerShutdownHook,
} from "./utils/gracefulShutdown.js";

// .env and secrets are already loaded by index.js before this module is imported.
const startServer = async () => {
  // Display the ASCII banner
  await asciiLogger();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // --- Middlewares ---
  app.use(cors());
  // Private by default so Cloudflare never caches user-specific responses.
  app.use(noStore);

  // --- Health / readiness (before any auth) ---
  app.use(healthRoutes);

  app.use(express.json());

  // --- API Documentation ---
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  //For Centralised Swagger
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

  // --- API Routes ---
  app.use("/api", apiRoutes);

  // --- Root Endpoint ---
  app.get("/", (req, res) => {
    res.json({ message: `Welcome to the be_health_service API! ✨` });
  });

  // --- Global Error Handler ---
  app.use((err, req, res, next) => {
    appLogger.error('Unhandled Error', 'SERVER', err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    });
  });

  // --- Connect DB and Start Server ---
  try {
    await connectDB();
    // await seedCategories();
    // Inactivity data-retention: erase this service's copy of a dormant
    // user's data when the user service says so. The account itself is
    // never touched — the user must still be able to log in afterwards.
    // Un-awaited: a Kafka outage must not stop the HTTP server booting
    // (the consumer retries forever and reports itself on /ready).
    startInactivityPurgeConsumer().catch((err) =>
      console.error("Failed to start inactivity purge consumer:", err)
    );
    const server = app.listen(PORT, () => {
      appLogger.info(`Server listening on http://localhost:${PORT}`, 'SERVER');
      appLogger.info(`API documentation available at http://localhost:${PORT}/api-docs`, 'SERVER');
    });

    // Closed in this order on SIGTERM / SIGINT.
    registerShutdownHook("http", () => closeHttpServer(server));
    registerShutdownHook("kafka-consumer", stopInactivityPurgeConsumer);
    registerShutdownHook("mongo", () => mongoose.connection.close());
    installShutdownHandlers();
  } catch (err) {
    appLogger.error("Failed to start server", 'SERVER', err);
    process.exit(1);
  }
};

startServer();
