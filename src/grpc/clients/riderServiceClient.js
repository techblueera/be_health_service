import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../protos/riderService.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const riderProto = grpc.loadPackageDefinition(packageDefinition).rider_service;

class RiderServiceClient {
  constructor(
    serverAddress = process.env.GRPC_RIDER_SERVER_ADDRESS || "localhost:50052"
  ) {
    this.serverAddress = serverAddress;
    this.client = new riderProto.RiderService(
      serverAddress,
      grpc.credentials.createInsecure()
    );

    // Circuit breaker options
    const circuitBreakerOptions = {
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 5000,
      errorThresholdPercentage:
        parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50,
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000,
    };

    // Create circuit breakers for critical methods
    this.getRiderByIdBreaker = new CircuitBreaker(
      this._getRiderById.bind(this),
      circuitBreakerOptions
    );
    this.getRidersByIdsBreaker = new CircuitBreaker(
      this._getRidersByIds.bind(this),
      circuitBreakerOptions
    );
    this.getRiderByUserIdBreaker = new CircuitBreaker(
      this._getRiderByUserId.bind(this),
      circuitBreakerOptions
    );
    this.getRiderByUserIdsBreaker = new CircuitBreaker(
      this._getRiderByUserIds.bind(this),
      circuitBreakerOptions
    );
    this.getRideOrderWithGroceryDataBreaker = new CircuitBreaker(
      this._getRideOrderWithGroceryData.bind(this),
      circuitBreakerOptions
    );
    this.getRideOrderWithPharmacyDataBreaker = new CircuitBreaker(
      this._getRideOrderWithPharmacyData.bind(this),
      circuitBreakerOptions
    );

    // Circuit breaker event handlers
    this._setupCircuitBreakerEvents("getRiderById", this.getRiderByIdBreaker);
    this._setupCircuitBreakerEvents("getRidersByIds", this.getRidersByIdsBreaker);
    this._setupCircuitBreakerEvents(
      "getRiderByUserId",
      this.getRiderByUserIdBreaker
    );
    this._setupCircuitBreakerEvents(
      "getRiderByUserIds",
      this.getRiderByUserIdsBreaker
    );
    this._setupCircuitBreakerEvents(
      "getRideOrderWithGroceryData",
      this.getRideOrderWithGroceryDataBreaker
    );
    this._setupCircuitBreakerEvents(
      "getRideOrderWithPharmacyData",
      this.getRideOrderWithPharmacyDataBreaker
    );

    logger.info(
      `gRPC RiderService client connected to ${serverAddress}`,
      "RiderServiceClient"
    );
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on("open", () =>
      logger.warn(`Circuit breaker OPEN for ${methodName}`, "RiderServiceClient")
    );
    breaker.on("halfOpen", () =>
      logger.info(
        `Circuit breaker HALF-OPEN for ${methodName}`,
        "RiderServiceClient"
      )
    );
    breaker.on("close", () =>
      logger.info(`Circuit breaker CLOSED for ${methodName}`, "RiderServiceClient")
    );
    breaker.on("fallback", () =>
      logger.warn(
        `Circuit breaker FALLBACK for ${methodName}`,
        "RiderServiceClient"
      )
    );
  }

  // Private methods that actual gRPC calls
  async _getRiderById(riderId) {
    return new Promise((resolve, reject) => {
      this.client.GetRiderById({ id: riderId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getRidersByIds(riderIds) {
    return new Promise((resolve, reject) => {
      this.client.GetRidersByIds({ ids: riderIds }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getRiderByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.client.GetRiderByUserId({ userId: userId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getRiderByUserIds(userIds) {
    return new Promise((resolve, reject) => {
      this.client.GetRiderByUserIds({ userIds: userIds }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getRideOrderWithGroceryData(orderId) {
    return new Promise((resolve, reject) => {
      this.client.GetRideOrderWithGroceryData(
        { orderId: orderId },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  async _getRideOrderWithPharmacyData(orderId) {
    return new Promise((resolve, reject) => {
      this.client.GetRideOrderWithPharmacyData(
        { orderId: orderId },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  // Public methods with circuit breaker
  async getRiderById(riderId) {
    try {
      return await this.getRiderByIdBreaker.fire(riderId);
    } catch (error) {
      logger.error(
        `getRiderById error for rider ${riderId}`,
        "RiderServiceClient",
        error
      );
      throw error;
    }
  }

  async getRidersByIds(riderIds) {
    try {
      return await this.getRidersByIdsBreaker.fire(riderIds);
    } catch (error) {
      logger.error("getRidersByIds error", "RiderServiceClient", error);
      throw error;
    }
  }

  async getRiderByUserId(userId) {
    try {
      return await this.getRiderByUserIdBreaker.fire(userId);
    } catch (error) {
      logger.error(
        `getRiderByUserId error for user ${userId}`,
        "RiderServiceClient",
        error
      );
      throw error;
    }
  }

  async getRiderByUserIds(userIds) {
    try {
      return await this.getRiderByUserIdsBreaker.fire(userIds);
    } catch (error) {
      logger.error("getRiderByUserIds error", "RiderServiceClient", error);
      throw error;
    }
  }

  async getRideOrderWithGroceryData(orderId) {
    try {
      return await this.getRideOrderWithGroceryDataBreaker.fire(orderId);
    } catch (error) {
      logger.error(
        `getRideOrderWithGroceryData error for order ${orderId}`,
        "RiderServiceClient",
        error
      );
      throw error;
    }
  }

  async getRideOrderWithPharmacyData(orderId) {
    try {
      return await this.getRideOrderWithPharmacyDataBreaker.fire(orderId);
    } catch (error) {
      logger.error(
        `getRideOrderWithPharmacyData error for order ${orderId}`,
        "RiderServiceClient",
        error
      );
      throw error;
    }
  }

  // Close the connection
  close() {
    this.client.close();
  }
}

// Create singleton instance
const riderServiceClient = new RiderServiceClient();

// Export convenience methods
export const getRiderById = (id) => riderServiceClient.getRiderById(id);
export const getRidersByIds = (ids) => riderServiceClient.getRidersByIds(ids);
export const getRiderByUserId = (userId) =>
  riderServiceClient.getRiderByUserId(userId);
export const getRiderByUserIds = (userIds) =>
  riderServiceClient.getRiderByUserIds(userIds);
export const getRideOrderWithGroceryData = (orderId) =>
  riderServiceClient.getRideOrderWithGroceryData(orderId);
export const getRideOrderWithPharmacyData = (orderId) =>
  riderServiceClient.getRideOrderWithPharmacyData(orderId);

export { RiderServiceClient as default };
