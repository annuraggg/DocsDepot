import House from "../../models/House.js";
import User from "../../models/User.js";
import Enrollment from "../../models/Enrollment.js";
import Certificate from "../../models/Certificate.js";
import { sendSuccess, sendError } from "../../utils/sendResponse.js";
import { ObjectId } from "mongodb";
import type { Context } from "hono";

const getDashboardData = async (c: Context) => {
  const data = await c.req.json();
  console.log(data);
  const { mid } = data;

  try {
    const allHouses = await House.find({});
    const user = await User.findOne({ mid: mid.toString() });

    if (!user) {
      return sendError(c, 500, "User not found");
      return;
    }

    let userHouse = null;
    if (user.house.id) {
      userHouse = await House.findOne({ _id: new ObjectId(user.house.id) });
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

const updateFirstTimeData = async (c: Context) => {
  const { mid, about, technical, projects, cgpa } = await c.req.json();

  try {
    const user = await User.findOne({ mid: mid.toString() });

    if (user) {
      await User.updateOne(
        { mid: mid.toString() },
        { $set: { firstTime: false, approved: false } }
      );
      await Enrollment.create({
        mid: mid.toString(),
        about: about.toString(),
        technical: technical.toString(),
        projects: projects.toString(),
        cgpa: parseFloat(cgpa),
      });
      return sendSuccess(c, 200, "First time data updated successfully");
    } else {
      return sendError(c, 500, "User not found");
    }
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating first time data");
  }
};

export { getDashboardData, updateFirstTimeData };
