import logger from "../utils/logger.js";
import { createMiddleware } from "hono/factory";
import { hrtime } from "process";
import fs from 'fs/promises';
import path from 'path';

const performanceStats = {
  endpointHits: {},
  responseTimes: []
};

async function updatePerformanceStats(statsData) {
  try {
    const statsPath = path.join(process.cwd(), 'performance-stats.json');
    await fs.writeFile(statsPath, JSON.stringify(statsData, null, 2));
  } catch (error) {
    logger.error('Failed to update performance stats', error);
  }
}

const performanceLogger = createMiddleware(async (c, next) => {
  const start = hrtime.bigint();

  return next().then(async () => {
    // Exceptions for logging
    if (c.req.path.startsWith("/static")) return;
    if (c.req.path.startsWith("/maintainance")) return;
    if (c.req.path.startsWith("/backup/backup-with-progress/")) return;

    const end = hrtime.bigint();
    const durationMs = Number((end - start) / BigInt(1_000_000)).toFixed(2);
    const isAuthenticated = !!c.get("user")?.mid;

    // Track endpoint hits
    performanceStats.endpointHits[c.req.path] = 
      (performanceStats.endpointHits[c.req.path] || 0) + 1;

    // Track response times
    performanceStats.responseTimes.push({
      path: c.req.path,
      method: c.req.method,
      responseTime: parseFloat(durationMs),
      status: c.res.status,
      authenticated: isAuthenticated
    });

    // Update stats file immediately
    await updatePerformanceStats(performanceStats);

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