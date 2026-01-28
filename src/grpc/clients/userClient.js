import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../protos/user.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

class UserClient {
  constructor(
    serverAddress = process.env.GRPC_USER_SERVER_ADDRESS || "localhost:50051"
        // serverAddress = "localhost:50053"

  ) {
    this.serverAddress = serverAddress;
    this.client = new userProto.UserService(
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
    this.getUserByIdBreaker = new CircuitBreaker(this._getUserById.bind(this), circuitBreakerOptions);
    this.getUsersByIdsBreaker = new CircuitBreaker(this._getUsersByIds.bind(this), circuitBreakerOptions);
    this.getUserInfoByIdListBreaker = new CircuitBreaker(this._getUserInfoByIdList.bind(this), circuitBreakerOptions);
    this.checkFollowingStatusBreaker = new CircuitBreaker(this._checkFollowingStatus.bind(this), circuitBreakerOptions);

    // Circuit breaker event handlers
    this._setupCircuitBreakerEvents('getUserById', this.getUserByIdBreaker);
    this._setupCircuitBreakerEvents('getUsersByIds', this.getUsersByIdsBreaker);
    this._setupCircuitBreakerEvents('getUserInfoByIdList', this.getUserInfoByIdListBreaker);
    this._setupCircuitBreakerEvents('checkFollowingStatus', this.checkFollowingStatusBreaker);

    logger.info(`gRPC User client connected to ${serverAddress}`, 'UserClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'UserClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'UserClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'UserClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'UserClient'));
  }

  // Private methods that actual gRPC calls
  async _getUserById(userId) {
    return new Promise((resolve, reject) => {
      this.client.GetUserById({ id: userId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getUsersByIds(userIds) {
    return new Promise((resolve, reject) => {
      this.client.GetUsersByIds({ ids: userIds }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _getUserInfoByIdList(userIds) {
    return new Promise((resolve, reject) => {
      this.client.GetUserInfoByIdList({ ids: userIds }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async _checkFollowingStatus(userId, authorIds) {
    return new Promise((resolve, reject) => {
      this.client.CheckFollowingStatus({ user_id: userId, author_ids: authorIds }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Public methods with circuit breaker
  async getUserById(userId) {
    try {
      return await this.getUserByIdBreaker.fire(userId);
    } catch (error) {
      logger.error(`getUserById error for user ${userId}`, 'UserClient', error);
      throw error;
    }
  }

  async getUsersByIds(userIds) {
    try {
      return await this.getUsersByIdsBreaker.fire(userIds);
    } catch (error) {
      logger.error('getUsersByIds error', 'UserClient', error);
      throw error;
    }
  }

  async getUserInfoByIdList(userIds) {
    try {
      return await this.getUserInfoByIdListBreaker.fire(userIds);
    } catch (error) {
      logger.error('getUserInfoByIdList error', 'UserClient', error);
      throw error;
    }
  }

  async checkFollowingStatus(userId, authorIds) {
    try {
      return await this.checkFollowingStatusBreaker.fire(userId, authorIds);
    } catch (error) {
      logger.error(`checkFollowingStatus error for user ${userId}`, 'UserClient', error);
      throw error;
    }
  }

  // Other methods without circuit breakers (less critical)
  async getAllProfessions() {
    return new Promise((resolve, reject) => {
      this.client.GetAllProfessions({}, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getProfessionsByLocation(location) {
    return new Promise((resolve, reject) => {
      this.client.GetProfessionsByLocation({ location }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getUsersByProfession(profession) {
    return new Promise((resolve, reject) => {
      this.client.GetUsersByProfession({ profession }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getUsersByProfessionAndLocation(profession, location) {
    return new Promise((resolve, reject) => {
      this.client.GetUsersByProfessionAndLocation(
        { profession, location },
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

  async getUsersByContacts(contacts) {
    return new Promise((resolve, reject) => {
      this.client.GetUsersByContacts(
        { contact_no: contacts },
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

  // Close the connection
  close() {
    this.client.close();
  }
}

// Create singleton instance
const userClient = new UserClient();

// Export convenience methods
export const getUserById = (id) => userClient.getUserById(id);
export const getUsersByIds = (ids) => userClient.getUsersByIds(ids);
export const getUserInfoByIdList = (ids) => userClient.getUserInfoByIdList(ids);
export const getAllProfessions = () => userClient.getAllProfessions();
export const getProfessionsByLocation = (location) =>
  userClient.getProfessionsByLocation(location);
export const getUsersByProfession = (profession) =>
  userClient.getUsersByProfession(profession);
export const getUsersByProfessionAndLocation = (profession, location) =>
  userClient.getUsersByProfessionAndLocation(profession, location);
export const getUsersByContacts = (contacts) =>
  userClient.getUsersByContacts(contacts);
export const checkFollowingStatus = (userId, authorIds) =>
  userClient.checkFollowingStatus(userId, authorIds);

export { UserClient as default };