// Every Kafka topic this service consumes or produces, in one place.
export const TOPICS = Object.freeze({
  // user-service -> us: erase a dormant user's data (see inactivityPurgeConsumer.js)
  USER_INACTIVITY_PURGE: "user.inactivity_purge",
  // us -> user-service: what the purge deleted
  USER_INACTIVITY_PURGE_ACK: "user.inactivity_purge_ack",
});

// Topics the consumer subscribes to; created on startup if missing.
export const CONSUMED_TOPICS = [TOPICS.USER_INACTIVITY_PURGE];
