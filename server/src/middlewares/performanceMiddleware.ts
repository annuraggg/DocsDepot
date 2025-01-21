import logger from "../utils/logger.js";
import { createMiddleware } from "hono/factory";
import { hrtime } from "process";

const performanceLogger = createMiddleware(async (c, next) => {
  const start = hrtime.bigint();

  return next().then(() => {
    // Exceptions
    if (c.req.path.startsWith("/static")) return;
    if (c.req.path.startsWith("/maintainance")) return;
    if (c.req.path.startsWith("/backup/backup-with-progress/")) return;

    const end = hrtime.bigint();
    const durationMs = Number((end - start) / BigInt(1_000_000)).toFixed(2);
    const isAuthenticated = !!c.get("user")?.mid;

    const logMessage = [
      `MT: ${c.req.method}`,
      `PA: ${c.req.path}`,
      `AU: ${isAuthenticated ? "Authenticated" : "Unauthenticated"}`,
      `ST: ${c.res.status}`,
      `RT: ${durationMs} ms`,
    ].join(" | ");

    logger.info(logMessage);
  });
});

export default performanceLogger;
