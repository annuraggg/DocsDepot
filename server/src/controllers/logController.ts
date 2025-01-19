import { Context } from "hono";
import fs from "fs";
import { sendError, sendSuccess } from "../utils/sendResponse";

const logFile = "server.log";

const getLogs = async (c: Context) => {
  try {
    const logs = fs.readFileSync(logFile, "utf8");
    return sendSuccess(c, 200, "Logs retrieved", logs);
  } catch (err) {
    return sendError(c, 500, "Error retrieving logs", err);
  }
};

export default {
  getLogs,
};
