import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";
import { loadSecrets } from "../../config/secrets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load secrets from AWS Secrets Manager
await loadSecrets();

const PROTO_PATH = path.join(__dirname, "../protos/auth.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth_service;

// In-memory cache with TTL
const sessionCache = new Map();
const CACHE_TTL = process.env.SESSION_CACHE_TTL || 60000; // 1 minute default

class AuthClient {
  constructor(
    serverAddress = process.env.GRPC_AUTH_SERVER_ADDRESS || "localhost:50051"
  ) {
    this.serverAddress = serverAddress;
    this.client = new authProto.AuthService(
      this.serverAddress,
      grpc.credentials.createInsecure()
    );

    const circuitBreakerOptions = {
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 5000,
      errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50,
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000,
      errorFilter: (error) => {
        if (error && error.code === grpc.status.NOT_FOUND) {
          return true; // Don't trip for "Not Found"
        }
        return false;
      }
    };

    this.validateSessionBreaker = new CircuitBreaker(this._validateSession.bind(this), circuitBreakerOptions);
    this._setupCircuitBreakerEvents('validateSession', this.validateSessionBreaker);

    logger.info(`gRPC Auth client connected to ${this.serverAddress}`, 'AuthClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'AuthClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'AuthClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'AuthClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'AuthClient'));
  }

  // Private method for the actual gRPC call
  async _validateSession(sessionId) {
    return new Promise((resolve, reject) => {
      this.client.ValidateSession({ session_id: sessionId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Public method with caching and circuit breaker
  async validateSession(sessionId) {
    // 1. Check cache first
    const cached = sessionCache.get(sessionId);
    if (cached && cached.expiry > Date.now()) {
      logger.info(`Session validation cache HIT for session ${sessionId}`, 'AuthClient');
      return cached.value;
    }

    logger.info(`Session validation cache MISS for session ${sessionId}`, 'AuthClient');

    try {
      // 2. If not in cache, call gRPC service via breaker
      const response = await this.validateSessionBreaker.fire(sessionId);

      // 3. Store successful validation in cache
      if (response && response.is_valid) {
        const cacheEntry = {
          value: response,
          expiry: Date.now() + CACHE_TTL,
        };
        sessionCache.set(sessionId, cacheEntry);
      }
      
      return response;
    } catch (error) {
      logger.error(`validateSession error for session ${sessionId}`, 'AuthClient', error);
      // Re-throw the error to be handled by the caller, consistent with other clients
      throw error;
    }
  }

  // Method to manually clear the cache if needed
  clearCache() {
    sessionCache.clear();
    logger.info('Session cache cleared', 'AuthClient');
  }
}

// Create singleton instance
const authClient = new AuthClient();

// Export convenience methods
export const validateSession = (sessionId) => authClient.validateSession(sessionId);
export const clearSessionCache = () => authClient.clearCache();

export { AuthClient as default };