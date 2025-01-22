import House from "../models/House.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import type { Context } from "hono";
import { sendError, sendSuccess } from "../utils/sendResponse.js";
import fs from "fs";
import path from "path";

// Define storage path for logos and banners
const __dirname = path.resolve();
const storagePath = path.join(__dirname, "../uploads");

export const getHouse = async (c: Context) => {
  const { id } = c.req.param();
  console.log(id);
  try {
    const house = await House.findById(id)
      .populate("members")
      .populate("facultyCordinator")
      .populate("studentCordinator")
      .lean();

    if (!house) {
      return sendError(c, 404, "House not found");
    }

    if (house) {
      return sendSuccess(c, 200, "House found", {
        house,
      });
    } else {
      return sendError(c, 404, "House not found");
    }
  } catch (err) {
    console.log(err);
    return sendError(c, 500, "Error fetching house");
  }
};

export const updateHouse = async (c: Context) => {
  const { id } = c.req.param();
  const { name, color, abstract, desc, socialLinks } = await c.req.json();

  try {
    await House.updateOne(
      { _id: id },
      {
        $set: { name, color, abstract, desc, socialLinks },
      }
    );
    return sendSuccess(c, 200, "House updated successfully");
  } catch (error) {
    return sendError(c, 500, "Error updating house");
  }
};

export const getAllHouses = async (c: Context) => {
  try {
    const houses = await House.find({});
    return sendSuccess(c, 200, "Houses found", houses);
  } catch (error) {
    return sendError(c, 500, "Error fetching houses");
  }
};

export const removeMember = async (c: Context) => {
  const { id } = c.req.param();
  const { mid } = await c.req.json();

  console.log(id, mid);

  const house = await House.findById(id);
  if (!house) return sendError(c, 404, "House not found");

  try {
    await House.updateOne({ _id: id }, { $pull: { members: mid } });
    await User.updateOne({ _id: mid }, { $set: { house: null } });
    return sendSuccess(c, 200, "Member removed successfully");
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error removing member");
  }
};

export const uploadLogo = async (c: Context) => {
  const image = await c.req.json();
  const houseId = c.req.param("id");

  const house = await House.findById(houseId);
  if (!house) return sendError(c, 404, "House not found");

  try {
    const fileName = `house_logo_${houseId}.png`;
    const filePath = path.join(storagePath, fileName);

    // Ensure the storage directory exists
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath);
    }

    const data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(data, "base64");

    // Save the image to disk
    fs.writeFileSync(filePath, imageBuffer);

    const url = `/uploads/${fileName}`;

    await House.updateOne({ _id: houseId }, { $set: { logo: url } });
    return sendSuccess(c, 200, "Logo updated successfully");
  } catch (error) {
    return sendError(c, 500, "Error updating logo");
  }
};

export const uploadBanner = async (c: Context) => {
  const image = await c.req.json();
  const houseId = c.req.param("id");

  try {
    const fileName = `house_banner_${houseId}.png`;
    const filePath = path.join(storagePath, fileName);

    // Ensure the storage directory exists
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath);
    }

    const data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(data, "base64");

    // Save the image to disk
    fs.writeFileSync(filePath, imageBuffer);

    const url = `/uploads/${fileName}`;

    await House.updateOne({ _id: houseId }, { $set: { banner: url } });
    return sendSuccess(c, 200, "Banner updated successfully");
  } catch (error) {
    return sendError(c, 500, "Error updating banner");
  }
};
