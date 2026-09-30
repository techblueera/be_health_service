// Graceful shutdown on SIGTERM / SIGINT.
//
// Resources register a close function with registerShutdownHook(). On the
// first signal the hooks run one after another in registration order (register
// the HTTP server first so no new work arrives, databases last). A second
// signal is ignored, and an unref'd timer forces exit after SHUTDOWN_TIMEOUT_MS
// so a hung close can never block a deploy.
const hooks = [];
let installed = false;
let shuttingDown = false;

export const registerShutdownHook = (name, fn) => {
  hooks.push({ name, fn });
};

export const closeHttpServer = (server) =>
  new Promise((resolve) => {
    server.close(() => resolve());
    server.closeIdleConnections?.();
  });

export const closeGrpcServer = (server) =>
  new Promise((resolve) => server.tryShutdown(() => resolve()));

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  const timeoutMs = Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10000;
  console.log(`[shutdown] ${signal} received, closing (timeout ${timeoutMs}ms)`);
  setTimeout(() => {
    console.warn(`[shutdown] timed out after ${timeoutMs}ms, forcing exit`);
    process.exit(0);
  }, timeoutMs).unref();

  for (const { name, fn } of hooks) {
    try {
      await fn();
      console.log(`[shutdown] closed ${name}`);
    } catch (err) {
      console.error(`[shutdown] failed to close ${name}:`, err?.message || err);
    }
  }
  process.exit(0);
};

export const installShutdownHandlers = () => {
  if (installed) return;
  installed = true;
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};
