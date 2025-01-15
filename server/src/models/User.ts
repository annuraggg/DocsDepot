import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    mid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    gender: { type: String, enum: ["M", "F"], required: true },
    role: { type: String, enum: ["A", "S", "F"], required: true }, // A for Admin, S for Student

    house: { type: mongoose.Types.ObjectId, default: null, ref: "House" },

    academicDetails: {
      academicYear: { type: Number },
      isDSE: { type: Boolean, default: false },
      branch: { type: String, default: "" },
      admissionYear: { type: Number },
    },
    social: {
      email: { type: String, default: "", unique: true },
      github: { type: String, default: "", unique: true },
      linkedin: { type: String, default: "", unique: true },
    },
    settings: {
      colorMode: { type: String, enum: ["light", "dark"], default: "light" },
      certificateLayout: {
        type: String,
        enum: ["green", "classic"],
        default: "classic",
      },
    },
    onboarding: {
      firstTime: { type: Boolean, default: false },
      approved: { type: Boolean, default: false },
      defaultPW: { type: Boolean, default: false },
    },
    permissions: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
