import { Context } from "hono";
import { sendError, sendSuccess } from "../utils/sendResponse";
import User from "../models/User";
import House from "../models/House";
import bcrypt from "bcrypt";

const getAllUsers = async (c: Context) => {
  try {
    const users = await User.find().populate("house").lean();
    console.log(users);
    return sendSuccess(c, 200, "Success", users);
  } catch (err) {
    console.log(err);
    return sendError(c, 500, "Internal Server Error");
  }
};

const getAllStudents = async (c: Context) => {
  try {
    console.log("Getting Students");
    const students = await User.find({ role: "S" }).populate("house").lean();
    return sendSuccess(c, 200, "Success", students);
  } catch (err) {
    console.log(err);
    return sendError(c, 500, "Internal Server Error");
  }
};

const getAllFaculty = async (c: Context) => {
  try {
    const faculty = await User.find({ role: "F" }).lean();
    const houses = await House.find().lean();
    return sendSuccess(c, 200, "Success", { faculty, houses });
  } catch {
    return sendError(c, 500, "Internal Server Error");
  }
};

const getAllAdmins = async (c: Context) => {
  try {
    const admins = await User.find({ role: "A" }).lean();
    return sendSuccess(c, 200, "Success", admins);
  } catch {
    return sendError(c, 500, "Internal Server Error");
  }
};

const getUserByMid = async (c: Context) => {
  const { mid } = c.req.param();
  console.log("Getting user by mid", mid);
  try {
    const user = await User.findOne({ mid }).populate("house").lean();
    if (!user) return sendError(c, 404, "User not found");
    return sendSuccess(c, 200, "Success", user);
  } catch {
    return sendError(c, 500, "Internal Server Error");
  }
};

const getUserById = async (c: Context) => {
  const { id } = c.req.param();
  try {
    const user = await User.findById(id).populate("house").lean();
    if (!user) return sendError(c, 404, "User not found");
    return sendSuccess(c, 200, "Success", user);
  } catch {
    return sendError(c, 500, "Internal Server Error");
  }
};

const updateUser = async (c: Context) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  try {
    const user = await User.findByIdAndUpdate(id, body, { new: true });
    if (!user) return sendError(c, 404, "User not found");
    return sendSuccess(c, 200, "User updated", user);
  } catch {
    return sendError(c, 500, "Internal Server Error");
  }
};

const deleteUser = async (c: Context) => {
  const { id } = c.req.param();
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return sendError(c, 404, "User not found");
    return sendSuccess(c, 200, "User deleted", user);
  } catch {
    return sendError(c, 500, "Internal Server Error");
  }
};

const createStudent = async (c: Context) => {
  const body = await c.req.json();
  try {
    const user = new User(body);
    const password = bcrypt.hashSync(process.env.DEFAULT_STUDENT_PASSWORD!, 10);
    user.password = password;
    await user.save();
    return sendSuccess(c, 200, "User created", user);
  } catch (err) {
    console.log(err)
    return sendError(c, 500, "Internal Server Error");
  }
};

const createFaculty = async (c: Context) => {
  const body = await c.req.json();
  try {
    const user = new User(body);
    const password = bcrypt.hashSync(process.env.DEFAULT_FACULTY_PASSWORD!, 10);
    user.password = password;
    await user.save();
    return sendSuccess(c, 200, "User created", user);
  } catch (err) {
    console.log(err)
    return sendError(c, 500, "Internal Server Error");
  }
};

export default {
  getAllUsers,
  getAllStudents,
  getAllFaculty,
  getAllAdmins,
  getUserByMid,
  getUserById,
  updateUser,
  deleteUser,
  createStudent,
  createFaculty,
};
