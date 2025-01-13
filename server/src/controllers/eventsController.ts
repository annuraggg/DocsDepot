import { ObjectId } from "mongodb";
import { sendSuccess, sendError } from "../utils/sendResponse.js";
import logger from "../utils/logger.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import House from "../models/House.js";
import Notification from "../models/Notification.js";
import Certificate from "../models/Certificate.js";
import type { Context } from "hono";

const getAllEvents = async (c: Context) => {
  try {
    const events = await Event.find();
    return sendSuccess(c, 200, "Events fetched successfully", events);
  } catch (err) {
    return sendError(c, 500, "Error in getting events");
  }
};

const getEventById = async (c: Context) => {
  const { id } = c.req.param();

  try {
    const event = await Event.findOne({ _id: id });
    if (!event) return sendError(c, 404, "Event not found");

    return sendSuccess(c, 200, "Event fetched successfully", event);
  } catch (err) {
    return sendError(c, 500, "Error in getting event");
  }
};

const updateEvent = async (c: Context) => {
  const { id } = c.req.param();
  const {
    name,
    image,
    desc,
    location,
    mode,
    link,
    email,
    phone,
    eventStarts,
    eventEnds,
    registerationStarts,
    registerationEnds,
  } = await c.req.json();

  try {
    await Event.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          image,
          desc,
          location,
          mode,
          link,
          email,
          phone,
          eventStarts: new Date(eventStarts),
          eventEnds: new Date(eventEnds),
          registerationStarts: new Date(registerationStarts),
          registerationEnds: new Date(registerationEnds),
        },
      }
    );
    return sendSuccess(c, 200, "Event updated successfully");
  } catch (err) {
    return sendError(c, 500, "Error in updating event");
  }
};

const deleteEvent = async (c: Context) => {
  const { id } = c.req.param();

  try {
    await Event.deleteOne({ _id: id });
    return sendSuccess(c, 200, "Event deleted successfully");
  } catch (err) {
    return sendError(c, 500, "Error in deleting event");
  }
};

const createEvent = async (c: Context) => {
  const {
    name,
    image,
    desc,
    location,
    mode,
    link,
    email,
    phone,
    eventStarts,
    eventEnds,
    registerationStarts,
    registerationEnds,
    registerationMode,
  } = await c.req.json();

  try {
    const eventDocument = {
      name,
      image,
      desc,
      location,
      mode,
      link,
      email,
      phone,
      eventStarts: new Date(eventStarts),
      eventEnds: new Date(eventEnds),
      registerationStarts: new Date(registerationStarts),
      registerationEnds: new Date(registerationEnds),
      createdAt: new Date(),
      registerationType: registerationMode,
      pointsAllocated: false,
      registered: registerationMode === "internal" ? [] : undefined,
    };

    await Event.create(eventDocument);
    return sendSuccess(c, 200, "Event created successfully");
  } catch (err) {
    return sendError(c, 500, "Error in creating event");
  }
};

const registerForEvent = async (c: Context) => {
  const { id } = c.req.param();
  const { mid } = await c.req.json();

  try {
    await Event.updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { registered: mid } }
    );
    await User.updateOne({ mid }, { $addToSet: { registeredEvents: id } });
    return sendSuccess(c, 200, "Registered for event successfully");
  } catch (err) {
    return sendError(c, 500, "Error in registering for event");
  }
};

const deregisterForEvent = async (c: Context) => {
  const { id } = c.req.param();
  const { mid } = await c.req.json();

  try {
    await Event.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { registered: mid } }
    );
    await User.updateOne({ mid }, { $pull: { registeredEvents: id } });
    return sendSuccess(c, 200, "Deregistered for event successfully");
  } catch (err) {
    return sendError(c, 500, "Error in deregistering for event");
  }
};

export default {
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  createEvent,
  registerForEvent,
  deregisterForEvent,
};
