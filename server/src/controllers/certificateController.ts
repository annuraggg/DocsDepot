import { ObjectId } from "mongodb";
import Certificate from "../models/Certificate.js";
import { sendSuccess, sendError } from "../utils/sendResponse.js";
import type { Context } from "hono";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Token } from "docsdepot-types/Token.js";
import { Certificate as ICertificate } from "docsdepot-types/Certificate.js";
import { User } from "docsdepot-types/User.js";
import House from "../models/House.js";
import UserModel from "../models/User.js";
import { Point } from "docsdepot-types/House.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions
type CertificateType = "external" | "internal" | "event";
type CertificateLevel = "beginner" | "intermediate" | "advanced" | "department";
type UploadType = "url" | "print" | "file";

// Ensure certificates directory exists
const certificatesPath = path.join(__dirname, "..", "certificates");
if (!fs.existsSync(certificatesPath)) {
  fs.mkdirSync(certificatesPath, { recursive: true });
}

interface ExtendedCertificate
  extends Omit<ICertificate, "issueDate" | "expirationDate" | "expires"> {
  certificate: File;
  issueDate: string;
  expirationDate: string;
  expires: "true" | "false";
}

// File type validation
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const getCertificates = async (c: Context) => {
  try {
    const certificates = await Certificate.find({})
      .populate("user")
      .populate("comments.user")
      .lean();

    if (!certificates) {
      return sendSuccess(c, 200, "No certificates found", []);
    }

    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      certificates
    );
  } catch (error) {
    return sendError(c, 500, "Error fetching certificates", error);
  }
};

const getCertificateById = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const certificate = await Certificate.findById(id)
      .populate("user")
      .populate("comments.user")
      .lean();

    if (!certificate) {
      return sendError(c, 200, "Certificate not found", []);
    }

    return sendSuccess(c, 200, "Certificate fetched successfully", certificate);
  } catch (error) {
    return sendError(c, 500, "Error fetching certificate", error);
  }
};

const getCertificatesByUserId = async (c: Context) => {
  try {
    const { _id } = (await c.get("user")) as Token;
    const { id } = c.req.param();
    const certificates = await Certificate.find({ user: id ? id : _id })
      .populate("user")
      .populate("comments.user")
      .lean();

    if (!certificates) {
      return sendSuccess(c, 200, "No certificates found", []);
    }

    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      certificates
    );
  } catch (error) {
    return sendError(c, 500, "Error fetching certificates", error);
  }
};

const createCertificate = async (c: Context) => {
  try {
    const formData =
      (await c.req.parseBody()) as unknown as ExtendedCertificate;
    const user = c.get("user") as Token;

    console.log(formData);
    console.log(formData?.level);

    // Extract file if present
    const certificateFile = formData.certificate;
    let url: string | undefined = formData.url ?? undefined;

    // Validate certificate type
    if (!isCertificateType(formData.type)) {
      return sendError(c, 400, "Invalid certificate type", null);
    }

    // Validate certificate level
    if (!isCertificateLevel(formData.level)) {
      return sendError(c, 400, "Invalid certificate level", null);
    }

    // Validate upload type
    if (!isUploadType(formData.uploadType)) {
      return sendError(c, 400, "Invalid upload type", null);
    }

    const issueDate = JSON.parse(formData.issueDate as string);
    const expirationDate = JSON.parse(formData.expirationDate as string);

    const certificate = new Certificate({
      user: user._id,
      name: formData.name || "",
      issuingOrganization: formData.issuingOrganization || "",
      issueDate: {
        month: issueDate.month || "",
        year: Number(issueDate.year) || new Date().getFullYear(),
      },
      expires: formData.expires === "true",
      expirationDate: {
        month: expirationDate?.month || "",
        year: Number(expirationDate?.year) || new Date().getFullYear(),
      },
      type: formData.type as CertificateType,
      level: formData.level as CertificateLevel,
      uploadType: formData.uploadType as UploadType,
      url: formData.url || "",
      status: "pending",
      comments: [],
      xp: 0,
    });

    if (formData.uploadType === "file" && certificateFile) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(certificateFile.type)) {
        return sendError(
          c,
          400,
          "Invalid file type. Only PDF and images are allowed.",
          null
        );
      }

      // Validate file size
      if (certificateFile.size > MAX_FILE_SIZE) {
        return sendError(c, 400, "File size exceeds 5MB limit.", null);
      }

      const fileExt = path.extname(certificateFile.name);
      const newFileName = `${certificate._id}${fileExt}`;
      const filePath = path.join(certificatesPath, newFileName);

      // Save the file
      const arrayBuffer = await certificateFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

      // Update certificate URL
      url = `/certificates/${newFileName}`;
      certificate.extension = fileExt;
    }

    certificate.url = url || "";
    await certificate.save();

    return sendSuccess(c, 200, "Certificate created successfully", certificate);
  } catch (error) {
    console.log(error);
    return sendError(c, 500, "Error creating certificate", error);
  }
};

const updateCertificate = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return sendError(c, 404, "Certificate not found", []);
    }

    const formData =
      (await c.req.parseBody()) as unknown as ExtendedCertificate;
    const certificateFile = formData.certificate;
    let url: string | undefined = formData.url ?? undefined;

    // Validate certificate type
    if (!isCertificateType(formData.type)) {
      return sendError(c, 400, "Invalid certificate type", null);
    }

    // Validate certificate level
    if (!isCertificateLevel(formData.level)) {
      return sendError(c, 400, "Invalid certificate level", null);
    }

    // Validate upload type
    if (!isUploadType(formData.uploadType)) {
      return sendError(c, 400, "Invalid upload type", null);
    }

    // Handle file deletion if changing from file to URL or new file
    if (certificate.uploadType === "file" && certificate.url) {
      const oldFilePath = path.join(__dirname, "..", certificate.url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const issueDate = JSON.parse(formData.issueDate as string);
    const expirationDate = JSON.parse(formData.expirationDate as string);

    // Update certificate fields
    certificate.name = formData.name || certificate.name;
    certificate.issuingOrganization =
      formData.issuingOrganization || certificate.issuingOrganization;
    certificate.issueDate = {
      month: issueDate.month || "",
      year: Number(issueDate.year) || new Date().getFullYear(),
    };
    certificate.expires = formData.expires === "true";
    certificate.expirationDate = {
      month: expirationDate?.month || "",
      year: Number(expirationDate?.year) || new Date().getFullYear(),
    };
    certificate.type = formData.type as CertificateType;
    certificate.level = formData.level as CertificateLevel;
    certificate.uploadType = formData.uploadType as UploadType;

    // Handle file upload for file type
    if (formData.uploadType === "file" && certificateFile) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(certificateFile.type)) {
        return sendError(
          c,
          400,
          "Invalid file type. Only PDF and images are allowed.",
          null
        );
      }

      // Validate file size
      if (certificateFile.size > MAX_FILE_SIZE) {
        return sendError(c, 400, "File size exceeds 5MB limit.", null);
      }

      const fileExt = path.extname(certificateFile.name);
      const newFileName = `${certificate._id}${fileExt}`;
      const filePath = path.join(certificatesPath, newFileName);

      // Save the file
      const arrayBuffer = await certificateFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

      // Update certificate URL
      url = `/certificates/${newFileName}`;
      certificate.extension = fileExt;
    }

    certificate.url = url || "";
    certificate.status = "pending";
    await certificate.save();

    return sendSuccess(c, 200, "Certificate updated successfully", certificate);
  } catch (error) {
    return sendError(c, 500, "Error updating certificate", error);
  }
};

const deleteCertificate = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return sendError(c, 404, "Certificate not found", []);
    }

    // Delete the associated file if it exists
    if (certificate.uploadType === "file" && certificate.url) {
      const filePath = path.join(__dirname, "..", certificate.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Certificate.deleteOne({ _id: new ObjectId(id) });

    return sendSuccess(c, 200, "Certificate deleted successfully", []);
  } catch (error) {
    return sendError(c, 500, "Error deleting certificate", error);
  }
};

const downloadCertificate = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return sendError(c, 404, "Certificate not found", null);
    }

    if (!certificate.url || certificate.uploadType !== "file") {
      return sendError(
        c,
        400,
        "Invalid certificate type file available for download",
        null
      );
    }

    const filePath = path.join(__dirname, "..", certificate.url);

    if (!fs.existsSync(filePath)) {
      return sendError(c, 404, "File not found", null);
    }

    // Read file and set appropriate headers
    const file = fs.readFileSync(filePath);
    const fileExt = path.extname(filePath).toLowerCase();

    let contentType = "application/octet-stream";
    switch (fileExt) {
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
    }

    // Set response headers
    c.header("Content-Type", contentType);
    c.header(
      "Content-Disposition",
      `attachment; filename="${certificate._id}${fileExt}"`
    );

    // Convert Buffer to ArrayBuffer for Hono context
    return c.body(new Uint8Array(file).buffer);
  } catch (error) {
    return sendError(c, 500, "Error downloading file", error);
  }
};

const commentOnCertificate = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { comment } = await c.req.json();
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return sendError(c, 404, "Certificate not found", []);
    }

    certificate.comments.push(comment);
    await certificate.save();

    return sendSuccess(c, 200, "Comment added successfully", certificate);
  } catch (error) {
    return sendError(c, 500, "Error adding comment", error);
  }
};

const getStudentCertificates = async (c: Context) => {
  try {
    const certificates = await Certificate.find()
      .populate("user")
      .populate("comments.user")
      .lean();

    if (!certificates) {
      return sendSuccess(c, 200, "No certificates found", []);
    }

    const studentCertificates = certificates.filter(
      (certificate: any) => (certificate.user as User)?.role === "S"
    );

    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      studentCertificates
    );
  } catch (error) {
    return sendError(c, 500, "Error fetching certificates", error);
  }
};

const getFacultyCertificates = async (c: Context) => {
  try {
    const certificates = await Certificate.find().populate("user").lean();

    if (!certificates) {
      return sendSuccess(c, 200, "No certificates found", []);
    }

    const facultyCertificates = certificates.filter(
      (certificate: any) => (certificate.user as User)?.role === "F"
    );

    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      facultyCertificates
    );
  } catch (error) {
    return sendError(c, 500, "Error fetching certificates", error);
  }
};

const getHouseCertificates = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const house = await House.findById(id);
    if (!house) {
      return sendError(c, 404, "House not found", null);
    }

    const members = house.members;

    const certificates = await Certificate.find({ user: { $in: members } })
      .populate("user")
      .lean();

    if (!certificates) {
      return sendSuccess(c, 200, "No certificates found", []);
    }

    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      certificates
    );
  } catch (error) {
    return sendError(c, 500, "Error fetching certificates", error);
  }
};

const getHouseAcceptedCertificates = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const house = await House.findById(id);
    if (!house) {
      return sendError(c, 404, "House not found", null);
    }

    const members = house.members;

    const certificates = await Certificate.find({
      user: { $in: members },
      status: "approved",
    })
      .populate("user")
      .lean();

    if (!certificates) {
      return sendSuccess(c, 200, "No certificates found", []);
    }

    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      certificates
    );
  } catch (error) {
    return sendError(c, 500, "Error fetching certificates", error);
  }
};

const getHousePendingCertificates = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const house = await House.findById(id);
    if (!house) {
      return sendError(c, 404, "House not found", null);
    }

    const members = house.members;

    const certificates = await Certificate.find({
      user: { $in: members },
      status: "pending",
    })
      .populate("user")
      .lean();

    if (!certificates) {
      return sendSuccess(c, 200, "No certificates found", []);
    }

    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      certificates
    );
  } catch (error) {
    return sendError(c, 500, "Error fetching certificates", error);
  }
};

const getHouseRejectedCertificates = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const house = await House.findById(id);
    if (!house) {
      return sendError(c, 404, "House not found", null);
    }

    const members = house.members;

    const certificates = await Certificate.find({
      user: { $in: members },
      status: "rejected",
    })
      .populate("user")
      .lean();

    if (!certificates) {
      return sendSuccess(c, 200, "No certificates found", []);
    }

    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      certificates
    );
  } catch (error) {
    return sendError(c, 500, "Error fetching certificates", error);
  }
};

const acceptCertificate = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return sendError(c, 404, "Certificate not found", null);
    }

    const user = await UserModel.findById(certificate.user);
    if (!user) {
      return sendError(c, 404, "User not found", null);
    }

    certificate.status = "approved";

    if (user?.role === "S") {
      certificate.earnedXp = 10;

      const newPoints = {
        certificateId: certificate._id,
        userId: user._id,
        points: 10,
      };

      await House.updateOne(
        { members: user._id },
        { $push: { points: newPoints } }
      );
    }

    await certificate.save();

    return sendSuccess(
      c,
      200,
      "Certificate accepted successfully",
      certificate
    );
  } catch (error) {
    return sendError(c, 500, "Error accepting certificate", error);
  }
};

const rejectCertificate = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return sendError(c, 404, "Certificate not found", null);
    }

    certificate.status = "rejected";
    await certificate.save();

    return sendSuccess(
      c,
      200,
      "Certificate rejected successfully",
      certificate
    );
  } catch (error) {
    return sendError(c, 500, "Error rejecting certificate", error);
  }
};

// Type guard functions
function isCertificateType(value: string): value is CertificateType {
  return ["external", "internal", "event"].includes(value);
}

function isCertificateLevel(value: string): value is CertificateLevel {
  return ["beginner", "intermediate", "advanced", "Department"].includes(value);
}

function isUploadType(value: string): value is UploadType {
  return ["url", "print", "file"].includes(value);
}

export default {
  getCertificates,
  getCertificateById,
  getCertificatesByUserId,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  downloadCertificate,
  getStudentCertificates,
  getFacultyCertificates,
  commentOnCertificate,
  getHouseCertificates,
  getHouseAcceptedCertificates,
  getHousePendingCertificates,
  getHouseRejectedCertificates,
  acceptCertificate,
  rejectCertificate,
};
