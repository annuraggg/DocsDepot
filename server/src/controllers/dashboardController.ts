import House from "../models/House.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Certificate from "../models/Certificate.js";
import { sendSuccess, sendError } from "../utils/sendResponse.js";
import { ObjectId } from "mongodb";
import type { Context } from "hono";
import { Token } from "scriptopia-types/Token.js";

const getStudentDashboard = async (c: Context) => {
  const { mid } = (await c.get("user")) as Token;

  try {
    const allHouses = await House.find({});
    const user = await User.findOne({ mid: mid.toString() });

    if (!user) {
      return sendError(c, 500, "User not found");
    }

    let userHouse = null;
    if (user.house) {
      userHouse = await House.findOne({ _id: user.house });
    }

    const certifications = await Certificate.find({ mid });

    return sendSuccess(c, 200, "Dashboard data fetched successfully", {
      allHouses,
      userHouse,
      user,
      certifications,
    });
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error fetching dashboard data");
  }
};

export default { getStudentDashboard };
