import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../protos/pharmacy.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const pharmacyProto = grpc.loadPackageDefinition(packageDefinition).pharmacy_service;

class PharmacyClient {
  constructor(
    serverAddress = "localhost:50052"
  ) {
    this.serverAddress = serverAddress;
    this.client = new pharmacyProto.PharmacyService(
      serverAddress,
      grpc.credentials.createInsecure()
    );

    const circuitBreakerOptions = {
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 5000,
      errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50,
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000,
    };

    this.updateOrderStatusBreaker = new CircuitBreaker(this._updateOrderStatus.bind(this), circuitBreakerOptions);
    this._setupCircuitBreakerEvents('updateOrderStatus', this.updateOrderStatusBreaker);

    this.getInventoryDetailsBreaker = new CircuitBreaker(this._getInventoryDetails.bind(this), circuitBreakerOptions);
    this._setupCircuitBreakerEvents('getInventoryDetails', this.getInventoryDetailsBreaker);
    
    this.getProductDetailsByVariantIdBreaker = new CircuitBreaker(this._getProductDetailsByVariantId.bind(this), circuitBreakerOptions);
    this._setupCircuitBreakerEvents('getProductDetailsByVariantId', this.getProductDetailsByVariantIdBreaker);


    logger.info(`gRPC Pharmacy client connected to ${serverAddress}`, 'PharmacyClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'PharmacyClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'PharmacyClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'PharmacyClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'PharmacyClient'));
  }

  async _updateOrderStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      this.client.UpdateOrderStatus({ orderId, status }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async updateOrderStatus(orderId, status) {
    try {
      return await this.updateOrderStatusBreaker.fire(orderId, status);
    } catch (error) {
      logger.error(`updateOrderStatus error for order ${orderId}`, 'PharmacyClient', error);
      throw error;
    }
  }

  async _getInventoryDetails(inventoryIds) {
    return new Promise((resolve, reject) => {
      this.client.GetInventoryDetails({ inventoryIds }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getInventoryDetails(inventoryIds) {
    try {
      return await this.getInventoryDetailsBreaker.fire(inventoryIds);
    } catch (error) {
      logger.error(`getInventoryDetails error for inventories ${inventoryIds}`, 'PharmacyClient', error);
      throw error;
    }
  }

  async _getProductDetailsByVariantId(variantIds) {
    return new Promise((resolve, reject) => {
      this.client.GetProductDetailsByVariantId({ variantIds }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getProductDetailsByVariantId(variantIds) {
    try {
      return await this.getProductDetailsByVariantIdBreaker.fire(variantIds);
    } catch (error) {
      logger.error(`getProductDetailsByVariantId error for variants ${variantIds}`, 'PharmacyClient', error);
      throw error;
    }
  }

  close() {
    this.client.close();
  }
}

const pharmacyClient = new PharmacyClient();

export const updateOrderStatus = (orderId, status) => pharmacyClient.updateOrderStatus(orderId, status);
export const getInventoryDetails = (inventoryIds) => pharmacyClient.getInventoryDetails(inventoryIds);
export const getProductDetailsByVariantId = (variantIds) => pharmacyClient.getProductDetailsByVariantId(variantIds);


export { PharmacyClient as default };
