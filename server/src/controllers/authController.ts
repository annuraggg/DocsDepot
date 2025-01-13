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

    let token;
    if (findUser.role === "A") {
      const data: Token = {
          _id: findUser._id.toString(),
          house: findUser.house.id.toString(),
          mid,
          fname: findUser.fname,
          lname: findUser.lname,
          picture: findUser.profilePicture,
          role: "A",
        },
        token = jwt.sign(data, process.env.JWT_SECRET!);
    } else if (findUser.role === "F") {
      const firstTime = findUser.defaultPW;
      if (firstTime) {
        token = "Invalid";
      } else {
        const data: Token = {
            _id: findUser._id.toString(),
            house: findUser.house.id.toString(),
            mid,
            fname: findUser.fname,
            lname: findUser.lname,
            picture: findUser.profilePicture,
            role: "F",
            perms: findUser.perms,
          },
          token = jwt.sign(data, process.env.JWT_SECRET!);
      }
    } else if (findUser.role === "S") {
      const firstTime = findUser.defaultPW;
      if (findUser.approved === false) {
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
            house: findUser.house.id.toString(),
            mid,
            fname: findUser.fname,
            lname: findUser.lname,
            ay: findUser.AY ? findUser.AY : undefined,
            branch: findUser.branch,
            picture: findUser.profilePicture,
            role: "S",
          },
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
      colorMode: findUser.colorMode,
      token,
      firstTime: findUser.defaultPW,
    });
  } catch (err) {
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
          house: user.house.id.toString(),
          mid,
          fname: user.fname,
          lname: user.lname,
          ay: user.AY ? user.AY : undefined,
          branch: user.branch,
          picture: user.profilePicture,
          role: user.role,
        };
        const token = jwt.sign(data, process.env.JWT_SECRET!);
        const expirationTime = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
        const expirationDate = new Date(Date.now() + expirationTime);

        return sendSuccess(c, 200, "Password Set Successfully", {
          role: user.role,
          mid,
          colorMode: user.colorMode,
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
  const { mid } = (await c.get("user")) as Token;
  try {
    const allHouses = await House.find({});
    const user = await User.findOne({ mid: mid.toString() });

    if (!user) {
      return sendError(c, 500, "User not found");
    }

    const certifications = await Certificate.find({ mid });

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
  const { mid } = (await c.get("user")) as Token;
  const { linkedin, github, email } = await c.req.json();

  try {
    const user = await User.findOne({ mid: mid.toString() });
    if (!user) {
      return sendError(c, 500, "User not found");
    }

    await User.updateOne(
      { mid: mid.toString() },
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
  const { mid } = (await c.get("user")) as Token;
  const { image } = await c.req.json();

  try {
    const user = await User.findOne({ mid: mid.toString() });
    if (!user) {
      return sendError(c, 500, "User not found");
    }

    await User.updateOne(
      { mid: mid.toString() },
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

export default {
  login,
  firstTimePassword,
  getProfile,
  updateProfile,
  updateProfilePicture,
};
