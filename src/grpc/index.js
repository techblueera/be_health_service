import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Import Service Logic
import pharmacyServiceImplementation from './service/pharmacy.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startGrpcServer = () => {
  console.log(chalk.blue("ℹ️  Starting gRPC Server..."));

  // Config
  const GRPC_PORT =  "50051";
  const GRPC_HOST = "0.0.0.0";

  // Create Server
  const server = new grpc.Server();

  // --- Pharmacy Service ---
  const PHARMACY_PROTO_PATH = path.join(__dirname, "protos", "pharmacy.proto");
  const pharmacyPackageDefinition = protoLoader.loadSync(PHARMACY_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    json: true,
  });
  const pharmacyProto = grpc.loadPackageDefinition(pharmacyPackageDefinition).pharmacy_service;
  server.addService(pharmacyProto.PharmacyService.service, pharmacyServiceImplementation);
  console.log(chalk.cyan(`   Pharmacy Service Proto definition loaded: ${PHARMACY_PROTO_PATH}`));


  // Bind and Start
  server.bindAsync(
    `${GRPC_HOST}:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(chalk.red("❌ gRPC Server bind failed:"), err);
        return;
      }
      console.log(chalk.green(`✅ gRPC Server listening on ${GRPC_HOST}:${port}`));
    }
  );
};