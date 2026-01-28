import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import CircuitBreaker from "opossum";
import logger from "../../utils/appLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../protos/channel.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const channelProto = grpc.loadPackageDefinition(packageDefinition).channel;

class ChannelClient {
  constructor(
    serverAddress = process.env.GRPC_CHANNEL_SERVICE_ADDRESS || "13.232.95.53:50051"
  ) {
    this.serverAddress = serverAddress;
    this.client = new channelProto.ChannelService(
      serverAddress,
      grpc.credentials.createInsecure()
    );

    const circuitBreakerOptions = {
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 5000,
      errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50,
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000,
    };

    this.getChannelBreaker = new CircuitBreaker(this._getChannel.bind(this), circuitBreakerOptions);

    this._setupCircuitBreakerEvents('getChannel', this.getChannelBreaker);

    logger.info(`gRPC Channel client connected to ${serverAddress}`, 'ChannelClient');
  }

  _setupCircuitBreakerEvents(methodName, breaker) {
    breaker.on('open', () => logger.warn(`Circuit breaker OPEN for ${methodName}`, 'ChannelClient'));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker HALF-OPEN for ${methodName}`, 'ChannelClient'));
    breaker.on('close', () => logger.info(`Circuit breaker CLOSED for ${methodName}`, 'ChannelClient'));
    breaker.on('fallback', () => logger.warn(`Circuit breaker FALLBACK for ${methodName}`, 'ChannelClient'));
  }

  async _getChannel({ id, userId }) {
    return new Promise((resolve, reject) => {
      this.client.GetChannel({ id, userId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.channel);
        }
      });
    });
  }

  async getChannelById(id, userId = '') {
    try {
      return await this.getChannelBreaker.fire({ id, userId });
    } catch (error) {
      logger.error(`getChannelById error for id ${id}`, 'ChannelClient', error);
      return null;
    }
  }

  close() {
    this.client.close();
  }
}

const channelClient = new ChannelClient();

export const getChannelById = (id, userId) => channelClient.getChannelById(id, userId);

export { ChannelClient as default };