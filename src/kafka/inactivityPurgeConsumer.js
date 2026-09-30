/**
 * Inactivity data-retention consumer — be_health_service.
 *
 * Listens on `user.inactivity_purge`, erases this service's copy of a dormant
 * user's data, and reports what it deleted on `user.inactivity_purge_ack`.
 *
 * The command always means "erase this user's content, KEEP their account".
 * This service must never delete or disable the account itself — the user has
 * to be able to log in afterwards and find a bare, re-onboardable profile.
 *
 * Orders are deleted outright, as specified.
 *
 * It opens its own Kafka connection rather than reusing this service's
 * kafka.client.js. The same file is dropped into every service in the platform,
 * and their clients differ (some expose no consumer factory at all); one
 * identical self-contained file is far less error-prone than N bespoke wirings.
 */

import { Kafka, Partitioners } from "kafkajs";
import mongoose from "mongoose";
import { TOPICS, CONSUMED_TOPICS } from "./topics.js";
import { ensureTopics } from "./ensureTopics.js";
import { setDependencyReady } from "../utils/readiness.js";
import Order from "../models/medicalModels/order.model.js";
import VariantChangeRequest from "../models/medicalModels/productVariantChangeRequest.model.js";

/**
 * Every collection this service purges, as an explicit, reviewable table.
 *
 * Rows are [label, Model, filter] for a delete, or
 * [label, Model, { match, update }, "unset"|"pull"] for an anonymise.
 */
const buildTargets = (uid, uidStr) => [
    ["orders", Order, { $or: [{ userId: uid }, { userId: uidStr }] }],
    ["variant_change_requests", VariantChangeRequest, { $or: [{ requestedBy: uid }, { requestedBy: uidStr }] }],
];

const SERVICE_NAME = "be_health_service";
const LOG = "[inactivity-purge]";

const TOPIC_PURGE = TOPICS.USER_INACTIVITY_PURGE;
const TOPIC_ACK = TOPICS.USER_INACTIVITY_PURGE_ACK;
// KAFKA_GROUP_ID overrides the group; the default keeps the existing group
// (and its committed offsets).
const groupId = () =>
  process.env.KAFKA_GROUP_ID || `${SERVICE_NAME}-inactivity-purge`;

let kafka = null;
let consumer = null;
let producer = null;

const client = () => {
  if (!kafka) {
    const brokers = (process.env.KAFKA_BROKERS || "").split(",").filter(Boolean);
    if (!brokers.length) throw new Error("KAFKA_BROKERS is not configured");
    kafka = new Kafka({ clientId: `${SERVICE_NAME}-retention`, brokers });
  }
  return kafka;
};

/**
 * Erase this service's data for `userId`.
 * @returns {Promise<Record<string, number>>} { label: docsAffected }
 */
export const purgeUserData = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);
  // Some collections store the id as a plain string rather than an ObjectId,
  // and which one it is varies by service and by age of the row. Matching both
  // costs one extra index probe and removes a whole class of silent misses.
  const uidStr = String(userId);
  const deleted = {};

  for (const [label, Model, filter, op] of buildTargets(uid, uidStr)) {
    try {
      if (op === "unset") {
        // Anonymise instead of delete: see the note in the header.
        const res = await Model.updateMany(filter.match, filter.update);
        if (res.modifiedCount) deleted[label] = res.modifiedCount;
      } else if (op === "pull") {
        const res = await Model.updateMany(filter.match, filter.update);
        if (res.modifiedCount) deleted[label] = res.modifiedCount;
      } else {
        const res = await Model.deleteMany(filter);
        if (res.deletedCount) deleted[label] = res.deletedCount;
      }
    } catch (err) {
      // One stubborn collection must not strand the rest half-done.
      console.error(`${LOG} failed on ${label} for user ${userId}:`, err.message);
      deleted[`${label}__error`] = -1;
    }
  }

  return deleted;
};

const sendAck = async (purgeId, userId, status, deleted, error) => {
  try {
    if (!producer) {
      producer = client().producer({
        createPartitioner: Partitioners.DefaultPartitioner,
      });
      await producer.connect();
    }
    await producer.send({
      topic: TOPIC_ACK,
      messages: [
        {
          key: String(userId),
          value: JSON.stringify({
            purgeId,
            userId: String(userId),
            service: SERVICE_NAME,
            status,
            deleted: deleted || {},
            error: error ? String(error).slice(0, 1000) : null,
            completedAt: new Date().toISOString(),
          }),
        },
      ],
    });
  } catch (err) {
    // The ack is bookkeeping. Losing it leaves a visible, fixable gap in the
    // audit trail; failing the purge over it would not be.
    console.warn(`${LOG} ack failed for ${purgeId}: ${err.message}`);
  }
};

export const handlePurgeCommand = async (payload) => {
  const { userId, purgeId, mode } = payload || {};
  if (!userId) return;

  // Refuse anything that is not the account-preserving content purge. If a
  // future mode means something stronger, this service must not guess at it.
  if (mode && mode !== "purge_content_keep_account") {
    console.warn(`${LOG} ignoring purge with unknown mode "${mode}"`);
    await sendAck(purgeId, userId, "skipped", {}, `unsupported mode: ${mode}`);
    return;
  }
  if (!mongoose.isValidObjectId(userId)) {
    await sendAck(purgeId, userId, "error", {}, "invalid userId");
    return;
  }

  try {
    const deleted = await purgeUserData(userId);
    console.log(`${LOG} purged user ${userId}:`, JSON.stringify(deleted));
    await sendAck(purgeId, userId, "ok", deleted, null);
  } catch (err) {
    console.error(`${LOG} purge failed for user ${userId}:`, err.message);
    await sendAck(purgeId, userId, "error", {}, err.message);
  }
};

const RETRY_MIN_MS = 5000;
const RETRY_MAX_MS = 60000;
let stopping = false;

/**
 * Connect, subscribe and run — retried forever with backoff (5 s doubling to
 * 60 s). A consumer that is not running is reported on GET /ready, never
 * silently skipped.
 */
export const startInactivityPurgeConsumer = async () => {
  setDependencyReady("kafka", false);
  let delay = RETRY_MIN_MS;
  for (let attempt = 1; !stopping; attempt++) {
    try {
      await ensureTopics(client(), CONSUMED_TOPICS);
      consumer = client().consumer({
        groupId: groupId(),
        sessionTimeout: 60000,
        maxWaitTimeInMs: Number(process.env.KAFKA_MAX_WAIT_MS) || 5000,
      });
      consumer.on(consumer.events.GROUP_JOIN, () => setDependencyReady("kafka", true));
      consumer.on(consumer.events.CRASH, ({ payload }) => {
        setDependencyReady("kafka", false);
        // kafkajs restarts by itself on retriable errors; otherwise start over.
        if (payload?.restart === false && !stopping) {
          console.error(`${LOG} consumer crashed, restarting: ${payload?.error?.message}`);
          const crashed = consumer;
          consumer = null;
          crashed?.disconnect().catch(() => {});
          startInactivityPurgeConsumer();
        }
      });
      await consumer.connect();
      await consumer.subscribe({ topic: TOPIC_PURGE, fromBeginning: false });
      await consumer.run({
        eachMessage: async ({ message }) => {
          try {
            await handlePurgeCommand(JSON.parse(message.value.toString()));
          } catch (err) {
            // Never let one malformed message stall the partition forever.
            console.error(`${LOG} bad message: ${err.message}`);
          }
        },
      });
      console.log(`${LOG} consumer running (topic ${TOPIC_PURGE}, group ${groupId()})`);
      return;
    } catch (err) {
      console.error(
        `${LOG} subscribe failed (attempt ${attempt}, retry in ${delay / 1000}s): ${err.message}`
      );
      await consumer?.disconnect().catch(() => {});
      consumer = null;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, RETRY_MAX_MS);
    }
  }
};

/** Disconnect the consumer and the ack producer (graceful shutdown). */
export const stopInactivityPurgeConsumer = async () => {
  stopping = true;
  setDependencyReady("kafka", false);
  await consumer?.disconnect().catch(() => {});
  await producer?.disconnect().catch(() => {});
  consumer = null;
  producer = null;
};

export default startInactivityPurgeConsumer;
