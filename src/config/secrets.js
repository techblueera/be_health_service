import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import chalk from "chalk";
import logger from '../utils/appLogger.js';

export const loadSecrets = async () => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Not in production, skipping AWS Secrets Manager.', 'SECRETS');
    return;
  }

  const secretName = "prod/be-prod-microservices"
  const region = "ap-south-1";
  if (!secretName || !region) {
    logger.error('SECRET_NAME or AWS_REGION is not defined in environment variables.', 'SECRETS');
    process.exit(1);
  }

  const client = new SecretsManagerClient({ region });

  logger.info('Attempting to load secrets from AWS Secrets Manager...', 'SECRETS');
  logger.debug(`Secret Name: ${secretName}`, 'SECRETS');
  logger.debug(`Region: ${region}`, 'SECRETS');

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await client.send(command);

    if (data.SecretString) {
      const secrets = JSON.parse(data.SecretString);
      let count = 0;
      for (const key in secrets) {
        if (!process.env[key]) {
          process.env[key] = secrets[key];
          count++;
        }
      }
      logger.info(`✔ Successfully loaded and set ${count} secret(s) into process.env.`, 'SECRETS');
    } else {
      logger.warn("Secret value was found, but SecretString was empty.", 'SECRETS');
    }
  } catch (error) {
    logger.error("FATAL ERROR: Could not fetch secrets from AWS Secrets Manager.", 'SECRETS', error);
    console.error(chalk.red("   Please check AWS credentials, IAM permissions, network connectivity, and secret configuration."));
    process.exit(1);
  }
};
