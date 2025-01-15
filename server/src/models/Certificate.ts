import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  comment: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true, trim: true },
    issuingOrganization: { type: String, required: true, trim: true },
    issueDate: {
      month: { type: String, required: true },
      year: { type: Number, required: true },
    },
    expires: { type: Boolean, default: false },
    expirationDate: {
      month: { type: String, default: null },
      year: { type: Number, default: null },
    },
    type: {
      type: String,
      enum: ["external", "internal", "event"],
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "department"],
      required: true,
    },
    uploadType: {
      type: String,
      enum: ["url", "print", "file"],
      required: true,
    },
    url: { type: String, default: null },
    extension: { type: String, required: false },
    status: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
    earnedXp: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },
    hashes: {
      sha256: { type: String, required: false },
      md5: { type: String, required: false },
    },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
