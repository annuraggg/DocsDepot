import { type Context } from "hono";
import { sendError, sendSuccess } from "../utils/sendResponse.js";
import User from "../models/User.js";
import House from "../models/House.js";
import bcrypt from "bcrypt";
import { type User as IUser } from "@shared-types/User.js";
import UserKeeper from "../gatekeepers/userKeeper.js";
import { type Token } from "@shared-types/Token.js";

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
    if (!user) return sendError(c, 404, "User not found");

    const houseUpdates = async (houseId: string, permission: string) => {
      const house = await House.findOne({ id: houseId });
      if (house) {
        if (body?.permissions?.includes(permission)) {
          if (house.facultyCordinator?.toString() !== id) {
            // @ts-expect-error
            house.facultyCordinator = id;
            await house.save();
          }
        } else if (house.facultyCordinator?.toString() === id) {
          house.facultyCordinator = null;
          await house.save();
        }
      }
    };

    // Update houses based on permissions
    await Promise.all([
      houseUpdates("H1", "H1"),
      houseUpdates("H2", "H2"),
      houseUpdates("H3", "H3"),
      houseUpdates("H4", "H4"),
    ]);

    // REMOVE HC01, HC02, HC03, HC04 from permissions
    body.permissions = body?.permissions?.filter(
      (perm: string) => !perm.startsWith("H")
    );

    const gate = new UserKeeper(token, user as unknown as IUser);
    await gate.update();

    if (user?.role === "F" && !body.permissions.includes("UFC")) {
      body.permissions.push("UFC");
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        fname: body.fname,
        lname: body.lname,
        "social.email": body.email,
        house: body?.house || null,
        permissions: body.permissions || [],
        gender: body.gender,
      },
      { new: true }
    );
    return sendSuccess(c, 200, "User updated", updatedUser);
  } catch (err) {
    console.error(err);
    return sendError(c, 500, "Internal Server Error");
  }
};

const deleteUser = async (c: Context) => {
  const { id } = c.req.param();
  const token = c.get("user") as Token;
  try {
    const user = await User.findById(id);
    if (!user) return sendError(c, 404, "User not found");

    const gate = new UserKeeper(token, user as unknown as IUser);
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
    const house = body.house || null;
    const firstTime = !body.house;

    const user = new User({
      ...body,
      role: "S",
      house,
      onboarding: { firstTime, approved: !firstTime, defaultPW: true },
      password: bcrypt.hashSync(process.env["DEFAULT_STUDENT_PASSWORD"]!, 10),
      academicDetails: {
        admissionYear: body.mid.slice(0, 2),
        isDSE: body.mid.slice(2, 3) === "2",
        branch: "IT",
        yearBacklog: 0,
      },
      social: { email: body.email, github: "", linkedin: "" },
    });

    const gate = new UserKeeper(token, user  as unknown as IUser);
    await gate.create();
    await user.save();

    return sendSuccess(c, 200, "User created", user);
  } catch (err) {
    console.error(err);
    return sendError(c, 500, "Internal Server Error");
  }
};

const bulkCreateStudents = async (c: Context) => {
  const { tableData } = await c.req.json();
  const token = c.get("user") as Token;

  try {
    const students: IUser[] = [];

    for (const student of tableData) {
      const user = new User({
        role: "S",
        mid: student[0],
        fname: student[1],
        lname: student[2],
        gender:
          student[3] === "Male" ? "M" : student[3] === "Female" ? "F" : "O",
        social: { email: student[4], github: "", linkedin: "" },
        password: bcrypt.hashSync(process.env["DEFAULT_STUDENT_PASSWORD"]!, 10),
        academicDetails: {
          admissionYear: student[0].slice(0, 2),
          isDSE: student[0].slice(2, 3) === "2",
          branch: "IT",
          yearBacklog: 0,
        },
      });

      const gate = new UserKeeper(token, user  as unknown as IUser);
      await gate.create();
      await user.save();

      students.push(user as unknown as IUser);
    }

    return sendSuccess(c, 200, "Students created", students);
  } catch (err) {
    console.error(err);
    return sendError(c, 500, "Internal Server Error");
  }
};

const createUser = async (userData: any, token: Token) => {
  // Hashing the password
  const password = bcrypt.hashSync(process.env["DEFAULT_FACULTY_PASSWORD"]!, 10);
  userData.password = password;

  console.log(userData)

  // Create the User
  const user = new User({
    ...userData,
    role: "F",
    onboarding: { firstTime: false, approved: false, defaultPW: true },
    social: { email: userData.email, github: "", linkedin: "" },
    academicDetails: { branch: "IT" },
  });

  // Check for house coordination and update accordingly
  if (userData?.perms?.some((perm: string) => perm.startsWith("H"))) {
    const house = userData.perms.find((perm: string) => perm.startsWith("H"));
    const fetchedHouse = await House.findOne({ id: house });

    if (!fetchedHouse) {
      throw new Error("House not found");
    }

    fetchedHouse.facultyCordinator = user._id;
    await fetchedHouse.save();
  }

  // Remove house-related permissions
  userData.permissions = userData?.perms?.filter(
    (perm: string) => !perm.startsWith("H")
  );

  user.permissions = userData.permissions || [];

  if (user?.role === "F" && !user?.permissions?.includes("UFC")) {
    user?.permissions?.push("UFC");
  }

  console.log(userData);
  console.log(user);

  // Create User and save it
  const gate = new UserKeeper(token, user  as unknown as IUser);
  await gate.create();
  await user.save();

  return user;
};

const createFaculty = async (c: Context) => {
  const body = await c.req.json();
  const token = c.get("user") as Token;

  try {
    const user = await createUser(body, token);
    return sendSuccess(c, 200, "User created", user);
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && (err as any).code === 11000) {
      return sendError(c, 409, "User already exists");
    }
    console.error(err);
    return sendError(c, 500, "Internal Server Error");
  }
};

const bulkCreateFaculty = async (c: Context) => {
  const { tableData } = await c.req.json();
  const token = c.get("user") as Token;

  try {
    // Process all users in parallel using Promise.all
    const facultyPromises = tableData.map(async (f: any) => {
      const data = {
        mid: f[0],
        fname: f[1],
        lname: f[2],
        gender: f[3] === "Male" ? "M" : f[3] === "Female" ? "F" : "O",
        email: f[4],
      };
      return await createUser(data, token); // Reuse the createUser logic
    });

    const faculty = await Promise.all(facultyPromises);

    return sendSuccess(c, 200, "Faculty created", faculty);
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && (err as any).code === 11000) {
      return sendError(c, 409, "User already exists");
    }

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
      const gate = new UserKeeper(token, user  as unknown as IUser);
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

    const gate = new UserKeeper(token, user  as unknown as IUser);
    await gate.reset();

    const password = bcrypt.hashSync(process.env["DEFAULT_STUDENT_PASSWORD"]!, 10);
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

const getNotAllotedUsers = async (c: Context) => {
  try {
    const users = await User.find({ house: null, role: "S" }).lean();
    return sendSuccess(c, 200, "Success", users);
  } catch {
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
  getNotAllotedUsers,
};
