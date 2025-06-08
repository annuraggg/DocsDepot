import { sendSuccess, sendError } from "../utils/sendResponse.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import type { Context } from "hono";
import type { Token } from "docsdepot-types/Token.js";
import House from "../models/House.js";
import { type House as IHouse } from "docsdepot-types/House.js";
import type { Certificate as ICertificate } from "docsdepot-types/Certificate.js";
import Certificate from "../models/Certificate.js";

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
    const event = await Event.findById(id).populate("participants.user");
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
  const { _id } = (await c.get("user")) as Token;

  try {
    // Assuming participants are stored as ObjectId references
    await Event.findByIdAndUpdate(id, {
      $addToSet: {
        participants: {
          user: _id,
          registeredAt: new Date(),
        },
      },
    });
    return sendSuccess(c, 200, "Registered for event successfully");
  } catch (err) {
    console.log(err);
    return sendError(c, 500, "Error in registering for event");
  }
};

const deregisterForEvent = async (c: Context) => {
  const { id } = c.req.param();
  const { _id } = (await c.get("user")) as Token;

  try {
    await Event.findByIdAndUpdate(id, { $pull: { participants: _id } });
    return sendSuccess(c, 200, "Deregistered for event successfully");
  } catch (err) {
    return sendError(c, 500, "Error in deregistering for event");
  }
};

const getMonthInThreeLetter = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[new Date().getMonth()] || "Jan";
};

const allocatePoints = async (c: Context) => {
  const { id } = c.req.param();
  const { points } = await c.req.json();

  try {
    // Fetch the event and houses in parallel to reduce waiting time
    const [event, allHouses] = await Promise.all([
      Event.findById(id),
      House.find(),
    ]);

    if (!event) return sendError(c, 404, "Event not found");

    const houseMap = allHouses.reduce((map, house) => {
      house.members.forEach((memberId) => {
        map.set(memberId.toString(), house as unknown as IHouse);
      });
      return map;
    }, new Map<string, IHouse>());

    // Fetch all participants' users in parallel
    const userIds = event.participants.map((p) => p.user);
    const users = await User.find({ _id: { $in: userIds } });

    // Create certificates and update points in parallel
    const certificatePromises: Promise<any>[] = [];
    const houseUpdatePromises: Promise<unknown>[] = [];

    users.forEach((user) => {
      const house = houseMap.get(user._id.toString());
      if (!house) return; // Skip if the user is not part of any house

      // Create certificate
      const certificate: ICertificate = {
        name: event.name,
        issuingOrganization: "A.P. Shah Institute of Technology",
        user: user._id?.toString(),
        issueDate: {
          month: getMonthInThreeLetter(),
          year: new Date().getFullYear(),
        },
        type: "event",
        level: "beginner",
        uploadType: "print",
        status: "approved",
        earnedXp: points,
        expires: false,
        comments: [],
      };

      const certificateDocument = new Certificate(certificate);
      certificatePromises.push(certificateDocument.save());

      // Prepare point object and update house
      const pointObj = {
        certificateId: certificateDocument._id,
        userId: user._id,
        points,
      };

      houseUpdatePromises.push(
        House.findByIdAndUpdate(house._id, {
          $push: { points: pointObj },
        })
      );
    });

    // Wait for all certificates to be saved
    await Promise.all(certificatePromises);

    // Wait for all house updates to be completed
    await Promise.all(houseUpdatePromises);

    // Mark points as allocated for the event
    await Event.findByIdAndUpdate(id, { pointsAllocated: true, points });

    return sendSuccess(c, 200, "Points allocated successfully");
  } catch (err) {
    console.error(err); // log the error for debugging
    return sendError(c, 500, "Error in allocating points");
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
  allocatePoints,
};
