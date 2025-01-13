import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  mid: { type: String, required: true },
  certificateName: { type: String, required: true },
  issuingOrg: { type: String, required: true },
  issueMonth: { type: String, required: true },
  issueYear: { type: Number, required: true },
  expires: { type: Boolean, default: false },
  expiryMonth: { type: String, default: null },
  expiryYear: { type: Number, default: null },
  certificateType: {
    type: String,
    enum: ["external", "internal", "event"],
    required: true,
  },
  certificateLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "Department"],
    required: true,
  },
  uploadType: { type: String, enum: ["url", "print", "file"], required: true },
  certificateURL: { type: String, default: null },
  status: {
    type: String,
    enum: ["approved", "rejected", "pending"],
    default: null,
  },
  house: { type: String, default: null },
  comments: { type: [String], default: null },
  xp: { type: Number, default: 0 },
  role: { type: String, enum: ["F", "M"], default: "F" },
  createdOn: { type: Date, default: Date.now },
  ext: { type: String, required: false },
  sha256: { type: String, required: false },
  md5: { type: String, required: false },
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
