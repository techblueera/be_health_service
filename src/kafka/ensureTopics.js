// Create any missing topics before a consumer subscribes.
//
// On a fresh broker, subscribing to a topic that does not exist yet fails with
// "This server does not host this topic-partition". createTopics() resolves to
// false (no error) for topics that already exist.
export const ensureTopics = async (kafka, topics) => {
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: topics.map((topic) => ({
        topic,
        numPartitions: Number(process.env.KAFKA_TOPIC_PARTITIONS) || 3,
        replicationFactor: Number(process.env.KAFKA_TOPIC_REPLICATION) || 1,
      })),
    });
  } catch (err) {
    if (!/already exists/i.test(err?.message || "")) throw err;
  } finally {
    await admin.disconnect().catch(() => {});
  }
};
