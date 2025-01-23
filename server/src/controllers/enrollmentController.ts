import type { Context } from "hono";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/sendResponse.js";
import { Token } from "docsdepot-types/Token.js";

export const createEnrollment = async (c: Context) => {
  const { about, technical, projects, cgpa } = await c.req.json();
  const { _id } = (await c.get("user")) as Token;
  try {
    const user = await User.findOne({ _id: _id });
    if (user) {
      await User.updateOne({ user: _id }, { $set: { "onboarding.firsttime": false } });
      await Enrollment.create({
        user: _id,
        about,
        technical,
        projects,
        cgpa: parseFloat(cgpa),
      });
      return sendSuccess(c, 201, "Enrollment created successfully");
    } else {
      return sendError(c, 400, "User not found");
    }
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Internal Server Error");
  }
};

const getEnrollments = async (c: Context) => {
  try {
    const enrollments = await Enrollment.find();
    return sendSuccess(c, 200, "Enrollments fetched successfully", enrollments);
  } catch (error) {
    return sendError(c, 500, "Internal Server Error");
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

export default { createEnrollment, getEnrollments, updateFirstTimeData };
