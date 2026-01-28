import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../protos/video.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const videoProto = grpc.loadPackageDefinition(packageDefinition).video;

class VideoClient {
  constructor(
    serverAddress = process.env.GRPC_VIDEO_SERVICE_ADDRESS || "localhost:50053"
        // serverAddress = "localhost:50054"

  ) {
    this.serverAddress = serverAddress;
    this.client = new videoProto.VideoService(
      serverAddress,
      grpc.credentials.createInsecure()
    );

    // Circuit breaker options
    const circuitBreakerOptions = {
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 5000,
      errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50,
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000,
    };

    // Create circuit breakers for critical methods
    this.getVideosBreaker = new CircuitBreaker(this._getVideos.bind(this), circuitBreakerOptions);
    this.getHotVideosBreaker = new CircuitBreaker(this._getHotVideos.bind(this), circuitBreakerOptions);
    this.searchVideosBreaker = new CircuitBreaker(this._searchVideos.bind(this), circuitBreakerOptions);

    // Circuit breaker event handlers
    this._setupCircuitBreakerEvents('getVideos', this.getVideosBreaker);
    this._setupCircuitBreakerEvents('getHotVideos', this.getHotVideosBreaker);
    this._setupCircuitBreakerEvents('searchVideos', this.searchVideosBreaker);

    logger.info(`gRPC Video client connected to ${serverAddress}`, 'VideoClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'VideoClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'VideoClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'VideoClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'VideoClient'));
  }

  // Private methods for actual gRPC calls
  async _getVideos(request) {
    return new Promise((resolve, reject) => {
      this.client.GetVideos(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getHotVideos(request) {
    return new Promise((resolve, reject) => {
      this.client.GetHotVideos(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _searchVideos(request) {
    return new Promise((resolve, reject) => {
      this.client.SearchVideos(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Public methods with circuit breaker
  async getVideos(request) {
    try {
      return await this.getVideosBreaker.fire(request);
    } catch (error) {
      logger.error('getVideos error', 'VideoClient', error);
      throw error;
    }
  }

  async getHotVideos(request) {
    try {
      return await this.getHotVideosBreaker.fire(request);
    } catch (error) {
      logger.error('getHotVideos error', 'VideoClient', error);
      throw error;
    }
  }

  async searchVideos(request) {
    try {
      return await this.searchVideosBreaker.fire(request);
    } catch (error) {
      logger.error('searchVideos error', 'VideoClient', error);
      throw error;
    }
  }

  // Other methods without circuit breaker (less critical)
  async getCategories(request) {
    return new Promise((resolve, reject) => {
      this.client.GetCategories(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getLikeStatus(request) {
    return new Promise((resolve, reject) => {
      this.client.GetLikeStatus(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Convenience methods
  async getVideosByIds(videoIds) {
    return this.getVideos({ video_ids: videoIds });
  }

  async getRecentVideos(limit = 20, page = 1) {
    return this.getHotVideos({ 
      type: 'recent', 
      limit,
      page 
    });
  }

  async getTrendingVideos(limit = 20, page = 1) {
    return this.getHotVideos({ 
      type: 'trending', 
      limit,
      page 
    });
  }

  async getShortVideos(limit = 20, page = 1) {
    return this.getHotVideos({ 
      type: 'short', 
      limit,
      page 
    });
  }

  async getLongVideos(limit = 20, page = 1) {
    return this.getHotVideos({ 
      type: 'long', 
      limit,
      page 
    });
  }

  // Close the connection
  close() {
    this.client.close();
  }
}

// Create singleton instance
const videoClient = new VideoClient();

// Export convenience methods
export const getVideos = (request) => videoClient.getVideos(request);
export const getHotVideos = (request) => videoClient.getHotVideos(request);
export const searchVideos = (request) => videoClient.searchVideos(request);
export const getCategories = (request) => videoClient.getCategories(request);
export const getLikeStatus = (request) => videoClient.getLikeStatus(request);
export const getVideosByIds = (videoIds) => videoClient.getVideosByIds(videoIds);
export const getRecentVideos = (limit, page) => videoClient.getRecentVideos(limit, page);
export const getTrendingVideos = (limit, page) => videoClient.getTrendingVideos(limit, page);
export const getShortVideos = (limit, page) => videoClient.getShortVideos(limit, page);
export const getLongVideos = (limit, page) => videoClient.getLongVideos(limit, page);

export { VideoClient as default };