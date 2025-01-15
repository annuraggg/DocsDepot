import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true },
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
    enum: ["beginner", "intermediate", "advanced", "department"],
    required: true,
  },
  uploadType: { type: String, enum: ["url", "print", "file"], required: true },
  certificateURL: { type: String, default: null },
  status: {
    type: String,
    enum: ["approved", "rejected", "pending"],
    default: "pending",
  },
  comments: { type: [commentSchema] },
  xp: { type: Number, default: 0 },
  createdOn: { type: Date, default: Date.now },
  ext: { type: String, required: false },
  sha256: { type: String, required: false },
  md5: { type: String, required: false },
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
