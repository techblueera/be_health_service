import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../protos/posts.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const postsProto = grpc.loadPackageDefinition(packageDefinition).posts;

class PostsClient {
  constructor(
    serverAddress = process.env.GRPC_POST_SERVICE || "localhost:50052"
    // serverAddress = "localhost:50051"
  ) {
    this.serverAddress = serverAddress;
    this.client = new postsProto.PostsService(
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
    this.getPostsBreaker = new CircuitBreaker(this._getPosts.bind(this), circuitBreakerOptions);
    this.getRecentPostsBreaker = new CircuitBreaker(this._getRecentPosts.bind(this), circuitBreakerOptions);
    this.getPostsCountBreaker = new CircuitBreaker(this._getPostsCountByUserId.bind(this), circuitBreakerOptions);
    this.checkPostLikesBreaker = new CircuitBreaker(this._checkPostLikes.bind(this), circuitBreakerOptions);
    this.getVideoPostsBreaker = new CircuitBreaker(this._getVideoPosts.bind(this), circuitBreakerOptions);


    // Circuit breaker event handlers
    this._setupCircuitBreakerEvents('getPosts', this.getPostsBreaker);
    this._setupCircuitBreakerEvents('getRecentPosts', this.getRecentPostsBreaker);
    this._setupCircuitBreakerEvents('getPostsCountByUserId', this.getPostsCountBreaker);
    this._setupCircuitBreakerEvents('checkPostLikes', this.checkPostLikesBreaker);
    this._setupCircuitBreakerEvents('getVideoPosts', this.getVideoPostsBreaker);

    logger.info(`gRPC Posts client connected to ${serverAddress}`, 'PostsClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'PostsClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'PostsClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'PostsClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'PostsClient'));
  }

  // Private methods for actual gRPC calls
  async _getPosts(request) {
    return new Promise((resolve, reject) => {
      this.client.GetPosts(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getRecentPosts(request) {
    return new Promise((resolve, reject) => {
      this.client.GetRecentPosts(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
  
  async _getPostsCountByUserId(request) {
    return new Promise((resolve, reject) => {
      this.client.GetPostsCountByUserId(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _checkPostLikes(request) {
    return new Promise((resolve, reject) => {
      this.client.CheckPostLikes(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getVideoPosts(request) {
    return new Promise((resolve, reject) => {
      this.client.GetVideoPosts(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Public methods with circuit breaker
  async getPosts(request) {
    try {
      return await this.getPostsBreaker.fire(request);
    } catch (error) {
      logger.error('getPosts error', 'PostsClient', error);
      throw error;
    }
  }

  async getRecentPosts(request) {
    try {
      return await this.getRecentPostsBreaker.fire(request);
    } catch (error) {
      logger.error('getRecentPosts error', 'PostsClient', error);
      throw error;
    }
  }

  async getPostsCountByUserId(request) {
    try {
      return await this.getPostsCountBreaker.fire(request);
    } catch (error) {
      logger.error('getPostsCountByUserId error', 'PostsClient', error);
      throw error;
    }
  }

  async checkPostLikes(request) {
    try {
      return await this.checkPostLikesBreaker.fire(request);
    } catch (error) {
      logger.error('checkPostLikes error', 'PostsClient', error);
      throw error;
    }
  }

  async getVideoPosts(request) {
    try {
      return await this.getVideoPostsBreaker.fire(request);
    } catch (error) {
      logger.error('getVideoPosts error', 'PostsClient', error);
      throw error;
    }
  }

  // Convenience methods
  async getPostsByIds(postIds) {
    return this.getPosts({ post_ids: postIds });
  }

  async getPostsByAuthor(authorId, { limit = 20, cursor = null, type = null } = {}) {
    const request = { 
      author_id: authorId, 
      limit, 
      cursor 
    };

    // Add post type to the request if it is provided
    if (type !== null && type !== undefined) {
      request.type = type;
    }

    return this.getPosts(request);
  }

  async getRecentPostsWithPagination({ cursor = null, limit = 20, types = [] } = {}) {
    return this.getRecentPosts({
      cursor,
      limit,
      types
    });
  }

  async getVideoPostsWithPagination({ page = 1, limit = 20 } = {}) {
    return this.getVideoPosts({
      page,
      limit,
    });
  }

  // Close the connection
  close() {
    this.client.close();
  }
}

// Create singleton instance
const postsClient = new PostsClient();

// Export convenience methods
export const getPosts = (request) => postsClient.getPosts(request);
export const getRecentPosts = (request) => postsClient.getRecentPosts(request);
export const getPostsByIds = (postIds) => postsClient.getPostsByIds(postIds);
export const getPostsByAuthor = (authorId, options) => postsClient.getPostsByAuthor(authorId, options);
export const getRecentPostsWithPagination = (options) => postsClient.getRecentPostsWithPagination(options);
export const getPostsCountByUserId = (userId) => postsClient.getPostsCountByUserId({ user_id: userId });
export const checkPostLikes = (userId, postIds) => postsClient.checkPostLikes({ user_id: userId, post_ids: postIds });
export const getVideoPostsWithPagination = (options) => postsClient.getVideoPostsWithPagination(options);

export { PostsClient as default };