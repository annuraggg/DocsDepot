import type { Context } from "hono";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/sendResponse.js";
import { Token } from "docsdepot-types/Token.js";
import House from "../models/House.js";

export const createEnrollment = async (c: Context) => {
  const { about, technical, projects, cgpa } = await c.req.json();
  const { _id } = (await c.get("user")) as Token;
  try {
    const user = await User.findOne({ _id: _id });
    console.log(_id);
    console.log(user);
    if (user) {
      const user = await User.findOne({ _id: _id });
      if (!user) return sendError(c, 400, "User not found");

      if (!user.onboarding) {
        user.onboarding = {
          approved: false,
          firstTime: false,
          defaultPW: false,
        };
      }

      user.onboarding.approved = false;
      user.onboarding.firstTime = false;
      await user.save();

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

const acceptEnrollment = async (c: Context) => {
  const { id } = await c.req.json();
  const { _id } = (await c.get("user")) as Token;
  try {
    const enrollment = await Enrollment.findOne({ _id: id });
    if (!enrollment) return sendError(c, 400, "Enrollment not found");

    const facultyHouse = await House.findOne({ facultyCordinator: _id });
    if (!facultyHouse)
      return sendError(c, 400, "Faculty not assigned to any house");

    const user = await User.findOne({ _id: enrollment.user });
    if (!user) return sendError(c, 400, "User not found");

    user.house = facultyHouse._id;
    user.onboarding!.approved = true;
    await user.save();

    await House.updateOne(
      { _id: facultyHouse._id },
      { $push: { members: user._id } }
    );

    await Enrollment.deleteOne({ _id: id });

    return sendSuccess(c, 200, "Enrollment accepted successfully");
  } catch (error) {
    console.error(error);
    return sendError(c, 500, "Internal Server Error");
  }
};

export default { createEnrollment, getEnrollments, acceptEnrollment };
