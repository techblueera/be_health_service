import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import { loadSecrets } from "./config/secrets.js";
import { connectDB } from "./config/database.js";
import appLogger from "./utils/appLogger.js";
import { asciiLogger } from "./utils/asciiLogger.js";
import apiRoutes from "./routes/index.js";

const startServer = async () => {
  // Load environment variables from .env file
  dotenv.config();

  // Load secrets from AWS Secrets Manager if in production
  await loadSecrets();

  // Display the ASCII banner
  await asciiLogger();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // --- Middlewares ---
  app.use(cors());
  app.use(express.json());

  // --- API Documentation ---
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
    app.listen(PORT, () => {
      appLogger.info(`Server listening on http://localhost:${PORT}`, 'SERVER');
      appLogger.info(`API documentation available at http://localhost:${PORT}/api-docs`, 'SERVER');
    });
  } catch (err) {
    appLogger.error("Failed to start server", 'SERVER', err);
    process.exit(1);
  }
};

startServer();
