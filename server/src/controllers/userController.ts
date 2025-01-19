import { Context } from "hono";
import { sendError, sendSuccess } from "../utils/sendResponse";
import User from "../models/User";
import House from "../models/House";
import bcrypt from "bcrypt";
import { User as IUser } from "scriptopia-types/User";
import UserKeeper from "../gatekeepers/userKeeper";
import { Token } from "scriptopia-types/Token";

const getAllUsers = async (c: Context) => {
  try {
    const users = await User.find().populate("house").lean();
    return sendSuccess(c, 200, "Success", users);
  } catch (err) {
    return sendError(c, 500, "Internal Server Error");
  }
};

const getAllStudents = async (c: Context) => {
  try {
    const students = await User.find({ role: "S" }).populate("house").lean();
    return sendSuccess(c, 200, "Success", students);
  } catch (err) {
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
  const token = c.get("user") as Token;
  try {
    const user = await User.findById(id).lean();
    const gate = new UserKeeper(token, user);
    await gate.update();

    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    if (!user) return sendError(c, 404, "User not found");
    return sendSuccess(c, 200, "User updated", updatedUser);
  } catch (err) {
    return sendError(c, 500, "Internal Server Error");
  }
};

const deleteUser = async (c: Context) => {
  const { id } = c.req.param();
  const token = c.get("user") as Token;
  try {
    const user = await User.findById(id);
    if (!user) return sendError(c, 404, "User not found");

    const gate = new UserKeeper(token, user);
    await gate.delete();

    await User.findByIdAndDelete(id);
    return sendSuccess(c, 200, "User deleted", user);
  } catch {
    return sendError(c, 500, "Internal Server Error");
  }
};

const createStudent = async (c: Context) => {
  const body = await c.req.json();
  const token = c.get("user") as Token;
  try {
    const user = new User(body);
    const password = bcrypt.hashSync(process.env.DEFAULT_STUDENT_PASSWORD!, 10);
    user.password = password;

    const admissionYear = body.mid.slice(0, 2);
    const isDSE = body.mid.slice(2, 3) === "2" ? true : false;
    const branch = "IT";
    const yearBacklog = 0;
    const social = { email: body.email, github: "", linkedin: "" };

    const gate = new UserKeeper(token, user);
    await gate.create();
    user.academicDetails = { admissionYear, isDSE, branch, yearBacklog };
    user.social = social;

    await user.save();
    return sendSuccess(c, 200, "User created", user);
  } catch (err) {
    console.log(err);
    return sendError(c, 500, "Internal Server Error");
  }
};

const createFaculty = async (c: Context) => {
  const body = await c.req.json();
  const token = c.get("user") as Token;
  try {
    const user = new User(body);
    const password = bcrypt.hashSync(process.env.DEFAULT_FACULTY_PASSWORD!, 10);
    user.password = password;

    const gate = new UserKeeper(token, user);
    await gate.create();

    await user.save();
    return sendSuccess(c, 200, "User created", user);
  } catch (err) {
    return sendError(c, 500, "Internal Server Error");
  }
};

const bulkCreateStudents = async (c: Context) => {
  const { tableData } = await c.req.json();
  const token = c.get("user") as Token;

  try {
    const students: IUser[] = [];
    for (const student of tableData) {
      const user = new User();
      const password = bcrypt.hashSync(
        process.env.DEFAULT_STUDENT_PASSWORD!,
        10
      );
      user.password = password;
      user.mid = student[0];
      user.fname = student[1];
      user.lname = student[2];
      user.gender =
        student[3] === "Male" ? "M" : student[3] === "Female" ? "F" : "O";
      user.social = { email: student[4], github: "", linkedin: "" };
      user.role = "S";

      const gate = new UserKeeper(token, user);
      await gate.create();

      await user.save();
      students.push(user as unknown as IUser);
    }
    return sendSuccess(c, 200, "Students created", students);
  } catch (err) {
    return sendError(c, 500, "Internal Server Error");
  }
};

const bulkCreateFaculty = async (c: Context) => {
  const { tableData } = await c.req.json();
  const token = c.get("user") as Token;

  try {
    const faculty: IUser[] = [];
    for (const f of tableData) {
      const user = new User(f);
      const password = bcrypt.hashSync(
        process.env.DEFAULT_FACULTY_PASSWORD!,
        10
      );
      user.password = password;

      const gate = new UserKeeper(token, user);
      await gate.create();

      await user.save();
      faculty.push(user as unknown as IUser);
    }
    return sendSuccess(c, 200, "Faculty created", faculty);
  } catch (err) {
    console.log(err);
    return sendError(c, 500, "Internal Server Error");
  }
};

const bulkDeleteUsers = async (c: Context) => {
  const { ids } = await c.req.json();
  const token = c.get("user") as Token;
  try {
    const users = await User.find({ _id: { $in: ids } });
    for (const user of users) {
      const gate = new UserKeeper(token, user);
      await gate.delete();
    }
    const deleted = await User.deleteMany({ _id: { $in: ids } });
    return sendSuccess(c, 200, "Users deleted", deleted);
  } catch {
    return sendError(c, 500, "Internal Server Error");
  }
};

const resetPassword = async (c: Context) => {
  const { mid } = await c.req.json();
  const token = c.get("user") as Token;

  console.log(mid);
  try {
    const user = await User.findOne({ mid });
    if (!user) return sendError(c, 404, "User not found");

    const gate = new UserKeeper(token, user);
    await gate.reset();

    const password = bcrypt.hashSync(process.env.DEFAULT_STUDENT_PASSWORD!, 10);
    user.password = password;
    user.onboarding = user?.onboarding
      ? { ...user.onboarding, defaultPW: true }
      : { defaultPW: true, firstTime: true, approved: false };
    await user.save();
    return sendSuccess(c, 200, "Password reset", user);
  } catch (err) {
    console.log(err);

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
  bulkCreateStudents,
  bulkCreateFaculty,
  bulkDeleteUsers,
  resetPassword,
};
