import mongoose from "mongoose";
import logger from '../utils/appLogger.js';

export const connectDB = async () => {
  try {
    // MONGO_URI is expected to be in process.env, loaded from .env or secrets manager
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    await mongoose.connect(process.env.MONGO_URI);
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
