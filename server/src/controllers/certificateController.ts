import { ObjectId } from "mongodb";
import Certificate from "../models/Certificate.js";
import { sendSuccess, sendError } from "../utils/sendResponse.js";
import type { Context } from "hono";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Token } from "scriptopia-types/Token.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions
type CertificateType = "external" | "internal" | "event";
type CertificateLevel = "beginner" | "intermediate" | "advanced" | "department";
type UploadType = "url" | "print" | "file";

interface CertificateFormData {
  user: string;
  title: string;
  issuingOrg: string;
  issueMonth: string;
  issueYear: string;
  expires: string;
  expiryMonth: string;
  expiryYear: string;
  certificateType: string;
  certificateLevel: string;
  uploadType: string;
  certificateURL?: string;
  certificate?: File;
}

// Ensure certificates directory exists
const certificatesPath = path.join(__dirname, "..", "certificates");
if (!fs.existsSync(certificatesPath)) {
  fs.mkdirSync(certificatesPath, { recursive: true });
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
    const certificates = await Certificate.find({}).populate("user").lean();

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
    const certificate = await Certificate.findById(id).populate("user").lean();

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
    const certificates = await Certificate.find({ _id: id ? id : _id }).populate("user").lean();

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
      (await c.req.parseBody()) as unknown as CertificateFormData;
    const user = c.get("user") as Token;

    console.log(formData);

    // Extract file if present
    const certificateFile = formData.certificate;
    let certificateURL: string | undefined = formData.certificateURL;

    // Validate certificate type
    if (!isCertificateType(formData.certificateType)) {
      return sendError(c, 400, "Invalid certificate type", null);
    }

    // Validate certificate level
    if (!isCertificateLevel(formData.certificateLevel)) {
      return sendError(c, 400, "Invalid certificate level", null);
    }

    // Validate upload type
    if (!isUploadType(formData.uploadType)) {
      return sendError(c, 400, "Invalid upload type", null);
    }

    const certificate = new Certificate({
      user: user._id,
      certificateName: formData.title || "",
      issuingOrg: formData.issuingOrg || "",
      issueMonth: formData.issueMonth || "",
      issueYear: parseInt(formData.issueYear) || new Date().getFullYear(),
      expires: formData.expires === "true",
      expiryMonth: formData.expiryMonth || "",
      expiryYear: parseInt(formData.expiryYear) || new Date().getFullYear(),
      certificateType: formData.certificateType as CertificateType,
      certificateLevel: formData.certificateLevel as CertificateLevel,
      uploadType: formData.uploadType as UploadType,
      url: formData.certificateURL || "",
      status: "pending",
      house: user.house,
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
      certificateURL = `/certificates/${newFileName}`;
      certificate.ext = fileExt;
    }

    certificate.certificateURL = certificateURL || "";
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
      (await c.req.parseBody()) as unknown as CertificateFormData;
    const certificateFile = formData.certificate;

    console.log(formData);

    // Validate certificate type
    if (!isCertificateType(formData.certificateType)) {
      return sendError(c, 400, "Invalid certificate type", null);
    }

    // Validate certificate level
    if (!isCertificateLevel(formData.certificateLevel)) {
      return sendError(c, 400, "Invalid certificate level", null);
    }

    // Validate upload type
    if (!isUploadType(certificate.uploadType)) {
      return sendError(c, 400, "Invalid upload type", null);
    }

    // If there's an existing file and we're uploading a new one, delete the old file
    if (certificate.uploadType === "file" && certificate.certificateURL) {
      const oldFilePath = path.join(
        __dirname,
        "..",
        certificate.certificateURL
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update certificate fields
    certificate.certificateName = formData.title || certificate.certificateName;
    certificate.issuingOrg = formData.issuingOrg || certificate.issuingOrg;
    certificate.issueMonth = formData.issueMonth || certificate.issueMonth;
    certificate.issueYear =
      parseInt(formData.issueYear) || certificate.issueYear;
    certificate.expires = formData.expires === "true";
    certificate.expiryYear =
      parseInt(formData.expiryYear) || certificate.expiryYear;
    certificate.certificateType = formData.certificateType as CertificateType;
    certificate.certificateLevel =
      formData.certificateLevel as CertificateLevel;

    if (certificate.uploadType === "file" && certificateFile) {
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
      certificate.certificateURL = `/certificates/${newFileName}`;
    }

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
    if (certificate.uploadType === "file" && certificate.certificateURL) {
      const filePath = path.join(__dirname, "..", certificate.certificateURL);
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

    if (!certificate.certificateURL || certificate.uploadType !== "file") {
      return sendError(
        c,
        400,
        "Invalid certificate type file available for download",
        null
      );
    }

    const filePath = path.join(__dirname, "..", certificate.certificateURL);

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
};
