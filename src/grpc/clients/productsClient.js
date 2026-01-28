import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../protos/products.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productsProto = grpc.loadPackageDefinition(packageDefinition).products;

class ProductsClient {
  constructor(
    serverAddress = process.env.GRPC_PRODUCT_SERVICE || "localhost:50054"
        // serverAddress = "localhost:50052"

  ) {
    this.serverAddress = serverAddress;
    this.client = new productsProto.ProductsService(
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
    this.getProductsBreaker = new CircuitBreaker(this._getProducts.bind(this), circuitBreakerOptions);
    this.getRecentProductsBreaker = new CircuitBreaker(this._getRecentProducts.bind(this), circuitBreakerOptions);

    // Circuit breaker event handlers
    this._setupCircuitBreakerEvents('getProducts', this.getProductsBreaker);
    this._setupCircuitBreakerEvents('getRecentProducts', this.getRecentProductsBreaker);

    logger.info(`gRPC Products client connected to ${serverAddress}`, 'ProductsClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'ProductsClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'ProductsClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'ProductsClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'ProductsClient'));
  }

  // Private methods for actual gRPC calls
  async _getProducts(request) {
    return new Promise((resolve, reject) => {
      this.client.GetProducts(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getRecentProducts(request) {
    return new Promise((resolve, reject) => {
      this.client.GetRecentProducts(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Public methods with circuit breaker
  async getProducts(request) {
    try {
      return await this.getProductsBreaker.fire(request);
    } catch (error) {
      logger.error('getProducts error', 'ProductsClient', error);
      throw error;
    }
  }

  async getRecentProducts(request) {
    try {
      return await this.getRecentProductsBreaker.fire(request);
    } catch (error) {
      logger.error('getRecentProducts error', 'ProductsClient', error);
      throw error;
    }
  }

  // Convenience methods
  async getProductsByIds(productIds) {
    return this.getProducts({ product_ids: productIds });
  }

  async getProductsByBusiness(businessId, limit = 20, cursor = null) {
    return this.getProducts({ 
      created_by_business: businessId, 
      limit, 
      cursor,
      is_published: true 
    });
  }

  async getRecentProductsWithPagination(cursor = null, limit = 20, types = []) {
    return this.getRecentProducts({
      cursor,
      limit,
      types,
      is_published: true
    });
  }

  async getPublishedProducts(limit = 20, cursor = null) {
    return this.getProducts({
      limit,
      cursor,
      is_published: true
    });
  }

  // Close the connection
  close() {
    this.client.close();
  }
}

// Create singleton instance
const productsClient = new ProductsClient();

// Export convenience methods
export const getProducts = (request) => productsClient.getProducts(request);
export const getRecentProducts = (request) => productsClient.getRecentProducts(request);
export const getProductsByIds = (productIds) => productsClient.getProductsByIds(productIds);
export const getProductsByBusiness = (businessId, limit, cursor) => productsClient.getProductsByBusiness(businessId, limit, cursor);
export const getRecentProductsWithPagination = (cursor, limit, types) => productsClient.getRecentProductsWithPagination(cursor, limit, types);
export const getPublishedProducts = (limit, cursor) => productsClient.getPublishedProducts(limit, cursor);

export { ProductsClient as default };