import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    mid: { type: String, required: true, unique: true, immutable: true },
    password: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    gender: { type: String, enum: ["M", "F", "O"], required: true },
    role: {
      type: String,
      enum: ["A", "S", "F"],
      required: true,
      immutable: true,
    }, // A for Admin, S for Student and F for Faculty

    house: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "House",
    },

    academicDetails: {
      isDSE: { type: Boolean, default: false, immutable: true },
      branch: { type: String, default: "", immutable: true },
      admissionYear: { type: Number, immutable: true },
      yearBacklog: { type: Number, default: 0 },
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
      firstTime: {
        type: Boolean,
        default: false,
        immutable: (doc) => doc.onboarding.firstTime,
      },
      approved: {
        type: Boolean,
        default: false,
        immutable: (doc) => doc.onboarding.approved,
      },
      defaultPW: {
        type: Boolean,
        default: false,
      },
    },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
