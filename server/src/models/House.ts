import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Certificate",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

const houseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
    abstract: { type: String, required: false },
    desc: { type: String, required: false },
    logo: { type: String, required: false },
    banner: { type: String, required: false },
    color: { type: String, required: false },
    facultyCordinator: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    studentCordinator: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    members: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
    social: {
      instagram: { type: String, required: false },
      linkedin: { type: String, required: false },
      twitter: { type: String, required: false },
    },
    points: { type: [pointSchema], required: false },
  },
  { timestamps: true }
);

const House = mongoose.model("House", houseSchema);
export default House;
