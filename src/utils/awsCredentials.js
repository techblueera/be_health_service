// Static keys only when both are set; otherwise the AWS SDK default chain (instance role) is used.
export const awsCredentials = (accessKeyId, secretAccessKey) =>
  accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;
