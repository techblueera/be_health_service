import mongoose from "mongoose";
import logger from '../utils/appLogger.js';

export const connectDB = async () => {
  try {
    // MONGO_URI_HEALTH_CARE_SERVICE is expected to be in process.env, loaded from .env or secrets manager
    // if (!process.env.MONGO_URI_HEALTH_CARE_SERVICE) {
    //   throw new Error('MONGO_URI_HEALTH_CARE_SERVICE is not defined in environment variables.');
    // }
    await mongoose.connect(process.env.MONGO_URI_HEALTH_CARE_SERVICE, {
      maxPoolSize: 10, // Default is 100. Drop this to 5-10 per pod.
      minPoolSize: 2, // Keep 2 warm connections
      maxIdleTimeMS: 30000, // Close connections idle for > 30s
    });
;
    logger.info("MongoDB connected successfully.", 'DB_CONNECT');

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected.', 'DB_CONNECT');
    });
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected.', 'DB_CONNECT');
    });

  } catch (error) {
    logger.error("MongoDB connection error", 'DB_CONNECT', error);
    process.exit(1);
  }
};
