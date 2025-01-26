import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    mode: { type: String, enum: ["online", "offline"], required: true },
    link: { type: String },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    registrationTimeline: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    eventTimeline: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    registerationType: {
      type: String,
      enum: ["internal", "external"],
      required: true,
    },
    pointsAllocated: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    participants: [ParticipantSchema],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
