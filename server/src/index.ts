import "dotenv/config";
import app from "./config/init.js";
import logger from "./utils/logger.js";

const port = parseInt(process.env.PORT!);

app.get("/health", (c) => {
  return c.json({ status: "ok", version: "1.0.0" });
});

app.get("/*", (c) => {
  return c.json({ status: "Not Found", code: 404 }, 404);
});

logger.info(`Server is running on port ${port}`);
