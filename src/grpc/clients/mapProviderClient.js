import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../protos/mapProvider.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const providerProto = grpc.loadPackageDefinition(packageDefinition).provider;

class MapProviderClient {
  constructor(
    serverAddress = process.env.GRPC_MAP_PROVIDER_SERVER_ADDRESS || "localhost:50052"
  ) {
    this.serverAddress = serverAddress;
    this.client = new providerProto.LiveLocation(
      serverAddress,
      grpc.credentials.createInsecure()
    );

    const circuitBreakerOptions = {
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 5000,
      errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50,
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000,
    };

    this.getUsersInRangeBreaker = new CircuitBreaker(this._getUsersInRange.bind(this), circuitBreakerOptions);

    this._setupCircuitBreakerEvents('getUsersInRange', this.getUsersInRangeBreaker);

    logger.info(`gRPC Map Provider client connected to ${serverAddress}`, 'MapProviderClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'MapProviderClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'MapProviderClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'MapProviderClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'MapProviderClient'));
  }

  async _getUsersInRange(request) {
    return new Promise((resolve, reject) => {
      this.client.GetUsersInRange(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getUsersInRange(center, range_in_km, limit) {
    try {
      return await this.getUsersInRangeBreaker.fire({ center, range_in_km, limit });
    } catch (error) {
      logger.error('getUsersInRange error', 'MapProviderClient', error);
      throw error;
    }
  }

  async getUserLocation(userId) {
    return new Promise((resolve, reject) => {
      this.client.GetUserLocation({ user_id: userId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  close() {
    this.client.close();
  }
}

const mapProviderClient = new MapProviderClient();

export const getUsersInRange = (center, range_in_km, limit) => mapProviderClient.getUsersInRange(center, range_in_km, limit);
export const getUserLocation = (userId) => mapProviderClient.getUserLocation(userId);

export { MapProviderClient as default };
