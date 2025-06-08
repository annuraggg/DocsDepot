import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import type { Context } from "hono";
import { sendError, sendSuccess } from "../utils/sendResponse.js";
import { type Token } from "docsdepot-types/Token.js";
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
        certificateTheme: findUser.settings?.certificateLayout || "classic",
        theme: findUser.settings?.colorMode || "light",
      };
      token = jwt.sign(data, process.env["JWT_SECRET"]!);
    } else if (findUser.role === "F") {
      const firstTime = findUser.onboarding?.defaultPW;
      if (firstTime) {
        token = "Invalid";
      } else {
        let house: undefined | string = undefined;

        const houseDoc = await House.findOne({
          facultyCordinator: findUser._id,
        });

        if (houseDoc) {
          house = houseDoc._id.toString();
        }

        const data: Token = {
          _id: findUser._id.toString(),
          house: house,
          profilePicture: findUser.profilePicture,
          mid,
          fname: findUser.fname,
          lname: findUser.lname,
          role: "F",
          perms: findUser.permissions,
          certificateTheme: findUser.settings?.certificateLayout || "classic",
          theme: findUser.settings?.colorMode || "light",
        };
        token = jwt.sign(data, process.env["JWT_SECRET"]!);
      }
    } else if (findUser.role === "S") {
      const firstTime = findUser.onboarding?.defaultPW;
      if (firstTime) {
        token = "Invalid";
      } else {
        const thisYear = new Date().getFullYear();
        const admissionYear =
          findUser.academicDetails?.admissionYear ?? thisYear;
        const academicYear = thisYear - admissionYear + 1;

        const data: Token = {
          _id: findUser._id.toString(),
          house: findUser.house?.toString(),
          profilePicture: findUser.profilePicture,
          mid,
          fname: findUser.fname,
          lname: findUser.lname,
          ay: academicYear,
          branch: findUser.academicDetails?.branch,
          role: "S",
          certificateTheme: findUser.settings?.certificateLayout || "classic",
          theme: findUser.settings?.colorMode || "light",
        };
        token = jwt.sign(data, process.env["JWT_SECRET"]!);
      }

      if (findUser.onboarding?.approved === false && !findUser?.onboarding.firstTime) {
        return sendError(
          c,
          403,
          "You have been not alloted to any house yet. Please try again after a while."
        );
      }
    }

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
    return sendError(c, 500, "Something went wrong");
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
              "onboarding.defaultPW": false,
            },
          }
        );

        const data: Token = {
          _id: user._id.toString(),
          house: user.house?.toString(),
          profilePicture: user.profilePicture,
          mid,
          fname: user.fname,
          lname: user.lname,
          ay: user.academicDetails?.admissionYear
            ? new Date().getFullYear() - user.academicDetails.admissionYear + 1
            : undefined,
          branch: user?.academicDetails?.branch,
          role: user.role,
          certificateTheme: user.settings?.certificateLayout || "classic",
          theme: user.settings?.colorMode || "light",
        };
        const token = jwt.sign(data, process.env["JWT_SECRET"]!);

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
  const { mid } = c.req.param();
  try {
    const allHouses = await House.find({});
    let user;
    if (mid) {
      user = await User.findOne({ mid });
    } else {
      user = await User.findOne({ _id });
    }

    if (!user) {
      return sendError(c, 500, "User not found");
    }

    const certifications = await Certificate.find({ user: user._id });

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
          "settings.colorMode": colorMode,
        },
      }
    );

    const newToken = jwt.sign(
      {
        _id: user._id,
        house: user.house,
        profilePicture: user.profilePicture,
        mid: user.mid,
        fname: user.fname,
        lname: user.lname,
        role: user.role,
        certificateTheme: user.settings?.certificateLayout || "classic",
        theme: colorMode,
      },
      process.env["JWT_SECRET"]!
    );

    return sendSuccess(c, 200, "Theme updated successfully", newToken);
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating theme");
  }
};

const updateCertificateTheme = async (c: Context) => {
  const { _id } = (await c.get("user")) as Token;
  const { certificateTheme } = await c.req.json();

  try {
    const user = await User.findOne({ _id: _id });
    if (!user) {
      return sendError(c, 500, "User not found");
    }

    await User.updateOne(
      { _id: _id },
      {
        $set: {
          "settings.certificateLayout": certificateTheme,
        },
      }
    );

    const newToken = jwt.sign(
      {
        _id: user._id,
        house: user.house,
        profilePicture: user.profilePicture,
        mid: user.mid,
        fname: user.fname,
        lname: user.lname,
        role: user.role,
        certificateTheme,
        theme: user.settings?.colorMode || "light",
      },
      process.env["JWT_SECRET"]!
    );

    return sendSuccess(
      c,
      200,
      "Certificate theme updated successfully",
      newToken
    );
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating certificate theme");
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
  updateCertificateTheme,
};
