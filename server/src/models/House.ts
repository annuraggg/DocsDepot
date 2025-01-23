import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    certificateId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Certificate",
    },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

const houseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
    abstract: { type: String, required: true },
    desc: { type: String, required: true },
    logo: { type: String, required: true },
    banner: { type: String, required: true },
    color: { type: String, required: true },
    facultyCordinator: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "User",
    },
    studentCordinator: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "User",
    },
    members: { type: [mongoose.Types.ObjectId], ref: "User" },
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
