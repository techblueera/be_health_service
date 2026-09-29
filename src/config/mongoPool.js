// Pool options for every MongoDB client this service opens.
//
// All BlueEra services share one Atlas cluster with a hard connection cap. The
// driver keeps a pool per replica-set member plus its own monitoring sockets,
// so keep defaults small and tune per deployment through env. appName tags
// this service's connections in Atlas (Real Time / currentOp).
export const getMongoPoolOptions = (overrides = {}) => ({
  maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 5),
  minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 0),
  maxIdleTimeMS: Number(process.env.MONGO_MAX_IDLE_MS || 60000),
  appName: process.env.MONGO_APP_NAME || "be_health_service",
  ...overrides,
});
