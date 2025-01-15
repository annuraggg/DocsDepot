import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    abstract: { type: String, required: true },
    desc: { type: String, required: true },
    logo: { type: String, required: true },
    banner: { type: String, required: true },
    color: { type: String, required: true },
    facultyCordinator: {
      type: mongoose.Types.ObjectId,
      required: true,
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
  },
  { timestamps: true }
);

const House = mongoose.model("House", houseSchema);
export default House;
