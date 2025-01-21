import { Context } from "hono";
import { maintainanceMode, setMaintainanceMode } from "../config/init";
import { sendError, sendSuccess } from "../utils/sendResponse";
import { Token } from "docsdepot-types/Token";

const toggleMaintainance = async (c: Context) => {
  try {
    const { mode } = await c.req.json();
    const user = (await c.get("user")) as Token;

    if (!user || user.role !== "A") {
      return sendError(c, 403, "Unauthorized");
    }

    setMaintainanceMode(mode);
    console.log(`Maintainance mode toggled to ${mode}`);

    return sendSuccess(c, 200, "Maintainance mode toggled successfully");
  } catch (error) {
    return sendError(c, 400, "Invalid request body");
  }
};

const getMaintainanceMode = async (c: Context) => {
  try {
    if (maintainanceMode === true) {
      return sendSuccess(c, 503, "Maintainance mode fetched successfully", {
        mode: maintainanceMode,
      });
    } else {
      return sendSuccess(c, 200, "Maintainance mode fetched successfully", {
        mode: maintainanceMode,
      });
    }
  } catch (error) {
    return sendError(c, 400, "Invalid request body");
  }
};

export default {
  toggleMaintainance,
  getMaintainanceMode,
};
