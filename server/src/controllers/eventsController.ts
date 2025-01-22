import { ObjectId } from "mongodb";
import { sendSuccess, sendError } from "../utils/sendResponse.js";
import logger from "../utils/logger.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
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
    const event = await Event.findById(id);
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
    contact,
    eventTimeline,
    registrationTimeline,
    registerationType,
  } = await c.req.json();

  try {
    await Event.findByIdAndUpdate(id, {
      $set: {
        name,
        image,
        desc,
        location,
        mode,
        link,
        contact,
        eventTimeline: {
          start: new Date(eventTimeline.start),
          end: new Date(eventTimeline.end),
        },
        registrationTimeline: {
          start: new Date(registrationTimeline.start),
          end: new Date(registrationTimeline.end),
        },
        registerationType,
      },
    });
    return sendSuccess(c, 200, "Event updated successfully");
  } catch (err) {
    return sendError(c, 500, "Error in updating event");
  }
};

const deleteEvent = async (c: Context) => {
  const { id } = c.req.param();

  try {
    await Event.findByIdAndDelete(id);
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
    contact,
    eventTimeline,
    registrationTimeline,
    registerationType,
  } = await c.req.json();

  try {
    const eventDocument = {
      name,
      image,
      desc,
      location,
      mode,
      link,
      contact,
      eventTimeline: {
        start: new Date(eventTimeline.start),
        end: new Date(eventTimeline.end),
      },
      registrationTimeline: {
        start: new Date(registrationTimeline.start),
        end: new Date(registrationTimeline.end),
      },
      registerationType,
      pointsAllocated: false,
    };

    await Event.create(eventDocument);
    return sendSuccess(c, 200, "Event created successfully");
  } catch (err) {
    console.log(err);
    return sendError(c, 500, "Error in creating event");
  }
};

const registerForEvent = async (c: Context) => {
  const { id } = c.req.param();
  const { mid } = await c.req.json();

  try {
    await Event.findByIdAndUpdate(id, { $addToSet: { participants: mid } });
    await User.findByIdAndUpdate(mid, { $addToSet: { registeredEvents: id } });
    return sendSuccess(c, 200, "Registered for event successfully");
  } catch (err) {
    return sendError(c, 500, "Error in registering for event");
  }
};

const deregisterForEvent = async (c: Context) => {
  const { id } = c.req.param();
  const { mid } = await c.req.json();

  try {
    await Event.findByIdAndUpdate(id, { $pull: { participants: mid } });
    await User.findByIdAndUpdate(mid, { $pull: { registeredEvents: id } });
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
