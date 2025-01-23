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
  const { house } = await c.req.json();

  try {
    await House.updateOne(
      { _id: id },
      {
        $set: {
          name: house.name,
          desc: house.desc,
          abstract: house.abstract,
          color: house.color,
          facultyCordinator: house.facultyCordinator,
          studentCordinator: house.studentCordinator,
          members: house.members,
          social: house.social,
        },
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

// Ensure certificates directory exists
const logoPath = path.join(__dirname, "src", "static", "houses", "logos");
if (!fs.existsSync(logoPath)) {
  fs.mkdirSync(logoPath, { recursive: true });
}

const bannerPath = path.join(__dirname, "src", "static", "houses", "banners");
if (!fs.existsSync(bannerPath)) {
  fs.mkdirSync(bannerPath, { recursive: true });
}

export const uploadLogo = async (c: Context) => {
  const houseId = c.req.param("id");
  const formData = await c.req.parseBody();
  const image: File = formData.image as File;
  console.log(image);

  const house = await House.findById(houseId);
  if (!house) return sendError(c, 404, "House not found");

  try {
    const fileName = `${houseId}.png`;
    const filePath = path.join(logoPath, fileName);
    const fileExt = path.extname(filePath);

    const arrayBuffer = await image.arrayBuffer();
    console.log(arrayBuffer);
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    await House.updateOne({ _id: houseId }, { $set: { logo: fileExt } });

    return sendSuccess(c, 200, "Logo updated successfully");
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating logo");
  }
};

export const uploadBanner = async (c: Context) => {
  const houseId = c.req.param("id");
  const formData = await c.req.parseBody();
  const image: File = formData.image as File;
  console.log(image);

  const house = await House.findById(houseId);
  if (!house) return sendError(c, 404, "House not found");

  try {
    const fileName = `${houseId}.png`;
    const filePath = path.join(bannerPath, fileName);
    const fileExt = path.extname(filePath);

    const arrayBuffer = await image.arrayBuffer();
    console.log(arrayBuffer);
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    await House.updateOne({ _id: houseId }, { $set: { banner: fileExt } });

    return sendSuccess(c, 200, "Banner updated successfully");
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error updating banner");
  }
};

export const addMember = async (c: Context) => {
  const { id } = c.req.param();
  const { _id } = await c.req.json();

  const house = await House.findById(id);
  if (!house) return sendError(c, 404, "House not found");

  try {
    await House.updateOne({ _id: id }, { $push: { members: _id } });
    await User.updateOne({ _id: _id }, { $set: { house: id } });
    return sendSuccess(c, 200, "Member added successfully");
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error adding member");
  }
};
