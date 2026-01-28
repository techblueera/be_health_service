import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";
import { loadSecrets } from "../../config/secrets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load secrets from AWS Secrets Manager before class definition (like index.js)
await loadSecrets();

const PROTO_PATH = path.join(__dirname, "../protos/business.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const businessProto = grpc.loadPackageDefinition(packageDefinition).business;

class BusinessClient {
  constructor(
    serverAddress = process.env.GRPC_USER_SERVER_ADDRESS || "localhost:50051"
    // serverAddress = "localhost:50053"
  ) {
    this.serverAddress = serverAddress || process.env.GRPC_USER_SERVER_ADDRESS || "localhost:50051";
    this.client = new businessProto.BusinessService(
      this.serverAddress,
      grpc.credentials.createInsecure()
    );

    // Circuit breaker options
    const circuitBreakerOptions = {
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 5000,
      errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50,
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000,
      
      // ADD THIS: prevent "Not Found" errors from tripping the breaker
      errorFilter: (error) => {
        // gRPC status code 5 is NOT_FOUND
        // gRPC status code 3 is INVALID_ARGUMENT
        const ignoredStatuses = [grpc.status.NOT_FOUND, grpc.status.INVALID_ARGUMENT];
        
        // If the error code is in our ignore list, return true (don't trip breaker)
        if (error && ignoredStatuses.includes(error.code)) {
          return true;
        }
        
        // Let all other errors (connection refused, timeouts) count towards failure
        return false;
      }
    };
    // Create circuit breakers for critical methods
    this.getBusinessByIdBreaker = new CircuitBreaker(this._getBusinessById.bind(this), circuitBreakerOptions);
    this.getBusinessByUserIdBreaker = new CircuitBreaker(this._getBusinessByUserId.bind(this), circuitBreakerOptions);
    this.getAllBusinessesBreaker = new CircuitBreaker(this._getAllBusinesses.bind(this), circuitBreakerOptions);
    this.getBusinessesByLocationBreaker = new CircuitBreaker(this._getBusinessesByLocation.bind(this), circuitBreakerOptions);

    // Circuit breaker event handlers
    this._setupCircuitBreakerEvents('getBusinessById', this.getBusinessByIdBreaker);
    this._setupCircuitBreakerEvents('getBusinessByUserId', this.getBusinessByUserIdBreaker);
    this._setupCircuitBreakerEvents('getAllBusinesses', this.getAllBusinessesBreaker);
    this._setupCircuitBreakerEvents('getBusinessesByLocation', this.getBusinessesByLocationBreaker);

    logger.info(`gRPC Business client connected to ${this.serverAddress}`, 'BusinessClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'BusinessClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'BusinessClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'BusinessClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'BusinessClient'));
  }

  // Private methods that actual gRPC calls
  async _getBusinessById(businessId) {
    return new Promise((resolve, reject) => {
      this.client.GetBusinessById({ business_id: businessId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getBusinessByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.client.GetBusinessByUserId({ user_id: userId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getAllBusinesses() {
    return new Promise((resolve, reject) => {
      this.client.GetAllBusinesses({}, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getBusinessesByLocation(lat, long, noOfEntries, radius) {
    return new Promise((resolve, reject) => {
      this.client.GetBusinessesByLocation({ lat, long, noOfEntries, radius }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Public methods with circuit breaker
  async getBusinessById(businessId) {
    try {
      return await this.getBusinessByIdBreaker.fire(businessId);
    } catch (error) {
      logger.error(`getBusinessById error for business ${businessId}`, 'BusinessClient', error);
      throw error;
    }
  }

  async getBusinessByUserId(userId) {
    try {
      return await this.getBusinessByUserIdBreaker.fire(userId);
    } catch (error) {
      logger.error(`getBusinessByUserId error for user ${userId}`, 'BusinessClient', error);
      throw error;
    }
  }

  async getAllBusinesses() {
    try {
      return await this.getAllBusinessesBreaker.fire();
    } catch (error) {
      logger.error('getAllBusinesses error', 'BusinessClient', error);
      throw error;
    }
  }

  async getBusinessesByLocation(lat, long, noOfEntries, radius) {
    try {
      return await this.getBusinessesByLocationBreaker.fire(lat, long, noOfEntries, radius);
    } catch (error) {
      logger.error(`getBusinessesByLocation error for location ${lat},${long}`, 'BusinessClient', error);
      throw error;
    }
  }

  // Method to reset circuit breakers (useful after fixing connection issues)
  resetCircuitBreakers() {
    try {
      this.getBusinessByIdBreaker.open = false;
      this.getBusinessByUserIdBreaker.open = false;
      this.getAllBusinessesBreaker.open = false;
      this.getBusinessesByLocationBreaker.open = false;
      logger.info('Circuit breakers reset successfully', 'BusinessClient');
    } catch (error) {
      logger.error('Failed to reset circuit breakers', 'BusinessClient', error);
    }
  }

  // Close the connection
  close() {
    this.client.close();
  }
}

// Create singleton instance
const businessClient = new BusinessClient();

// Export convenience methods
export const getBusinessById = (id) => businessClient.getBusinessById(id);
export const getBusinessByUserId = (id) => businessClient.getBusinessByUserId(id);
export const getAllBusinesses = () => businessClient.getAllBusinesses();
export const getBusinessesByLocation = (lat, long, noOfEntries, radius) =>
  businessClient.getBusinessesByLocation(lat, long, noOfEntries, radius);

// Export circuit breaker reset method
export const resetCircuitBreakers = () => businessClient.resetCircuitBreakers();

export { BusinessClient as default };
