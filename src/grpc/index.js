import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Import Service Logic
import medicalServiceImplementation from './service/medical.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startGrpcServer = () => {
  console.log(chalk.blue("ℹ️  Starting gRPC Server..."));

  // Config
  const GRPC_PORT =  "50051";
  const GRPC_HOST = "0.0.0.0";

  // Create Server
  const server = new grpc.Server();

  // --- Medical Service ---
  const MEDICAL_PROTO_PATH = path.join(__dirname, "protos", "medical.proto");
  const medicalPackageDefinition = protoLoader.loadSync(MEDICAL_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    json: true,
  });
  const medicalProto = grpc.loadPackageDefinition(medicalPackageDefinition).medical_service;
  server.addService(medicalProto.MedicalService.service, medicalServiceImplementation);
  console.log(chalk.cyan(`   Medical Service Proto definition loaded: ${MEDICAL_PROTO_PATH}`));


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