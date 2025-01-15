import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import type { Context } from "hono";
import { sendError, sendSuccess } from "../utils/sendResponse.js";
import { Token } from "scriptopia-types/Token.js";
import House from "../models/House.js";
import Certificate from "../models/Certificate.js";

const login = async (c: Context) => {
  const { mid, password } = await c.req.json();
  try {
    const findUser = await User.findOne({ mid: mid.toString() });
    if (!findUser) {
      console.log("User not found");
      return sendError(c, 401, "Invalid Credentials");
    }

    const verify = await bcrypt.compare(password, findUser.password);
    if (!verify) {
      return sendError(c, 401, "Invalid Credentials");
    }

    let token = ""; // Declare token once at the top

    if (findUser.role === "A") {
      const data: Token = {
        _id: findUser._id.toString(),
        house: findUser?.house?.toString(),
        profilePicture: findUser.profilePicture,
        mid,
        fname: findUser.fname,
        lname: findUser.lname,
        role: "A",
      };
      token = jwt.sign(data, process.env.JWT_SECRET!);
    } else if (findUser.role === "F") {
      const firstTime = findUser.onboarding?.defaultPW;
      if (firstTime) {
        token = "Invalid";
      } else {
        const data: Token = {
          _id: findUser._id.toString(),
          house: findUser.house.toString(),
          profilePicture: findUser.profilePicture,
          mid,
          fname: findUser.fname,
          lname: findUser.lname,
          role: "F",
          perms: findUser.permissions,
        };
        token = jwt.sign(data, process.env.JWT_SECRET!);
      }
    } else if (findUser.role === "S") {
      const firstTime = findUser.onboarding?.defaultPW;
      if (findUser.onboarding?.approved === false) {
        return sendError(
          c,
          403,
          "You have been not alloted to any house yet. Please try again after a while."
        );
      }
      if (firstTime) {
        token = "Invalid";
      } else {
        const data: Token = {
          _id: findUser._id.toString(),
          house: findUser.house.toString(),
          profilePicture: findUser.profilePicture,
          mid,
          fname: findUser.fname,
          lname: findUser.lname,
          ay: findUser.academicDetails?.academicYear
            ? findUser.academicDetails?.academicYear
            : undefined,
          branch: findUser.academicDetails?.branch,
          role: "S",
        };
        token = jwt.sign(data, process.env.JWT_SECRET!);
      }
    }

    const expirationTime = 4 * 60 * 60 * 1000;

    const roleName =
      findUser.role === "A"
        ? "Admin"
        : findUser.role === "F"
        ? "Faculty"
        : "Student";
    logger.info(`${roleName} ${mid} logged in at ${new Date().toISOString()}`);

    return sendSuccess(c, 200, "Logged In", {
      role: findUser.role,
      mid,
      colorMode: findUser?.settings?.colorMode,
      token,
      firstTime: findUser.onboarding?.defaultPW,
    });
  } catch (err) {
    console.error(err);
    sendError(c, 500, "Something went wrong");
  }
};

const firstTimePassword = async (c: Context) => {
  const { mid, password, password2 } = await c.req.json();
  try {
    if (password === password2) {
      const user = await User.findOne({ mid: mid.toString() });
      if (user) {
        await User.updateOne(
          { mid: mid.toString() },
          {
            $set: {
              password: await bcrypt.hash(password, 10),
              defaultPW: false,
            },
          }
        );

        const data: Token = {
          _id: user._id.toString(),
          house: user.house.toString(),
          profilePicture: user.profilePicture,
          mid,
          fname: user.fname,
          lname: user.lname,
          ay: user.academicDetails?.academicYear ? user.academicDetails?.academicYear : undefined,
          branch: user?.academicDetails?.branch,
          role: user.role,
        };
        const token = jwt.sign(data, process.env.JWT_SECRET!);
        const expirationTime = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

        return sendSuccess(c, 200, "Password Set Successfully", {
          role: user.role,
          mid,
          colorMode: user?.settings?.colorMode,
          token,
        });
      } else {
        return sendError(c, 500, "Something went wrong");
      }
    } else {
      return sendError(c, 400, "Passwords do not match");
    }
  } catch (err) {
    return sendError(c, 500, "Something went wrong");
  }
};

const getProfile = async (c: Context) => {
  // give the following data back: allHouses, user, certifications for the user
  const { _id } = (await c.get("user")) as Token;
  try {
    const allHouses = await House.find({});
    const user = await User.findOne({ _id: _id });

    if (!user) {
      return sendError(c, 500, "User not found");
    }

    const certifications = await Certificate.find({ user: _id });

    return sendSuccess(c, 200, "Profile data fetched successfully", {
      allHouses,
      user,
      certifications,
    });
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error fetching profile data");
  }
};

const updateProfile = async (c: Context) => {
  const { _id } = (await c.get("user")) as Token;
  const { linkedin, github, email } = await c.req.json();

  try {
    const user = await User.findOne({ _id: _id });
    if (!user) {
      return sendError(c, 500, "User not found");
    }

    await User.updateOne(
      { _id: _id },
      {
        $set: {
          linkedin,
          github,
          email,
        },
      }
    );

    return sendSuccess(c, 200, "Profile updated successfully");
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating profile");
  }
};

const updateProfilePicture = async (c: Context) => {
  const { _id } = (await c.get("user")) as Token;
  const { image } = await c.req.json();

  try {
    const user = await User.findOne({ _id: _id });
    if (!user) {
      return sendError(c, 500, "User not found");
    }

    await User.updateOne(
      { _id: _id },
      {
        $set: {
          profilePicture: image,
        },
      }
    );

    return sendSuccess(c, 200, "Profile picture updated successfully");
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating profile picture");
  }
};

const updatePassword = async (c: Context) => {
  const { _id } = (await c.get("user")) as Token;
  const { oldPass, newPass } = await c.req.json();

  try {
    const user = await User.findOne({ _id: _id });
    if (!user) {
      return sendError(c, 500, "User not found");
    }

    const verify = await bcrypt.compare(oldPass, user.password);
    if (!verify) {
      return sendError(c, 401, "Old password is incorrect");
    }

    await User.updateOne(
      { _id: _id },
      {
        $set: {
          password: await bcrypt.hash(newPass, 10),
        },
      }
    );

    return sendSuccess(c, 200, "Password updated successfully");
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating password");
  }
};

const updateTheme = async (c: Context) => {
  const { _id } = (await c.get("user")) as Token;
  const { colorMode } = await c.req.json();

  try {
    const user = await User.findOne({ _id: _id });
    if (!user) {
      return sendError(c, 500, "User not found");
    }

    await User.updateOne(
      { _id: _id },
      {
        $set: {
          colorMode,
        },
      }
    );

    return sendSuccess(c, 200, "Theme updated successfully");
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating theme");
  }
};

export default {
  login,
  firstTimePassword,
  getProfile,
  updateProfile,
  updateProfilePicture,
  updatePassword,
  updateTheme,
};
