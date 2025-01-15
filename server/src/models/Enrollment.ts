import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  about: { type: String, default: "" },
  technical: { type: String, default: "" },
  projects: { type: String, default: "" },
  cgpa: { type: Number, required: true },
}, { timestamps: true });


const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;