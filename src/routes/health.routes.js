import { Router } from "express";
import mongoose from "mongoose";
import { getDependencyStates } from "../utils/readiness.js";

// Liveness / readiness probes. nginx strips /api/<svc>-service, so these are
// served at the root and registered before any auth middleware.
const router = Router();

// Liveness: the process is up. Never touches a database.
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Readiness: every dependency this instance needs is connected.
router.get("/ready", (req, res) => {
  const checks = {
    mongo: mongoose.connection.readyState === 1,
    ...getDependencyStates(),
  };
  const failed = Object.keys(checks).filter((name) => !checks[name]);

  res.status(failed.length ? 503 : 200).json({
    status: failed.length ? "unavailable" : "ok",
    checks,
    ...(failed.length && { failed }),
  });
});

export default router;
