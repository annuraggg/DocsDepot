import mongoose from "mongoose";
import Certificate from "../../models/Certificate.js";
import User from "../../models/User.js";
import { sendSuccess, sendError } from "../../utils/sendResponse.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { Context } from "hono";
import { mkdirSync } from "fs";

// Directory for storing certificates locally
const __dirname = path.resolve();
const CERTIFICATES_DIR = path.resolve(__dirname, "../../uploads/certificates");

// Ensure the directory exists
mkdirSync(CERTIFICATES_DIR, { recursive: true });

// Fetch certificates
const getCertificates = async (c: Context) => {
  const { mid } = await c.req.json();

  try {
    const certificates = await Certificate.find({ mid }).exec();
    return sendSuccess(
      c,
      200,
      "Certificates fetched successfully",
      certificates
    );
  } catch (error) {
    return sendError(c, 400, "Error fetching certificates");
  }
};

// Upload certificate
const uploadCertificate = async (c: Context) => {
  const { mid } = await c.req.json();

  try {
    const {
      issuingOrg,
      issueMonth,
      issueYear,
      expires,
      expiryMonth,
      expiryYear,
      certificateType,
      certificateLevel,
      certificateName: cName,
    } = await c.req.json();
    const certificate = await c.req.formData();

    if (!certificate) {
      return sendError(c, 400, "No certificate provided");
    }

    const _id = new mongoose.Types.ObjectId();
    const user = await User.findOne({ mid });

    if (certificate.get("certificateURL")) {
      await Certificate.create({
        mid: mid.toString(),
        certificateName: cName,
        issuingOrg,
        issueMonth,
        issueYear: parseInt(issueYear),
        expires,
        expiryMonth,
        expiryYear,
        certificateType,
        certificateLevel,
        uploadType: "url",
        certificateURL: certificate.get("certificateURL"),
        status: "pending",
        house: user?.house.id,
        name: `${user?.fname} ${user?.lname}`,
        submittedYear: new Date().getFullYear(),
        submittedMonth: new Date().getMonth(),
      });
      return sendSuccess(c, 200, "Certificate URL uploaded");
    }

    const file = certificate.get("file"); // assuming formData includes the file under 'file'

    if (!file) {
      return sendError(c, 400, "No certificate file uploaded");
    }

    // @ts-expect-error
    const originalFileName = file.originalname;
    const certificateName = `${mid}/${_id}-${originalFileName}`;
    const filePath = path.join(CERTIFICATES_DIR, certificateName);

    // Create a write stream to save the file locally
    const writeStream = fs.createWriteStream(filePath); // @ts-expect-error
    file.stream().pipe(writeStream);

    // Wait until the file is written to disk
    writeStream.on("finish", async () => {
      const sha256 = crypto
        .createHash("sha256") // @ts-expect-error
        .update(file.buffer)
        .digest("hex"); // @ts-expect-error
      const md5 = crypto.createHash("md5").update(file.buffer).digest("hex");

      await Certificate.create({
        _id,
        mid: mid.toString(),
        certificateName: cName,
        issuingOrg,
        issueMonth,
        issueYear: parseInt(issueYear),
        expires,
        expiryMonth,
        expiryYear,
        certificateType,
        certificateLevel,
        uploadType: "file",
        certificateURL: certificateName, // Store path relative to upload directory
        status: "pending",
        ext: originalFileName.split(".")[1],
        house: user?.house?.id,
        name: `${user?.fname} ${user?.lname}`,
        submittedYear: new Date().getFullYear(),
        submittedMonth: new Date().getMonth(),
        sha256,
        md5,
      });

      return sendSuccess(c, 200, "Certificate file uploaded");
    });
  } catch (error) {
    return sendError(c, 400, "Error uploading certificate");
  }
};

// Download certificate
const downloadCertificate = async (c: Context) => {
  const { id } = await c.req.json();

  try {
    const certificate = await Certificate.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!certificate) {
      return sendError(c, 404, "Certificate not found");
    }

    if (certificate.uploadType === "url") {
      return sendError(c, 400, "Invalid certificate type for download");
    }

    const filePath = path.join(CERTIFICATES_DIR, certificate.certificateURL);

    if (!fs.existsSync(filePath)) {
      return sendError(c, 404, "Certificate file not found");
    }

    const readStream = fs.createReadStream(filePath); // @ts-expect-error
    readStream.pipe(c.res);
  } catch (error) {
    return sendError(c, 500, "Internal server error");
  }
};

// Delete certificate
const deleteCertificate = async (c: Context) => {
  const { id } = await c.req.json();

  try {
    const certificate = await Certificate.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!certificate) {
      return sendError(c, 400, "Certificate not found");
    }

    if (certificate.uploadType === "file") {
      const filePath = path.join(CERTIFICATES_DIR, certificate.certificateURL);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
      }
    }

    await Certificate.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    return sendSuccess(c, 200, "Certificate deleted");
  } catch (error) {
    return sendError(c, 400, "Certificate not found");
  }
};

// Update certificate
const updateCertificate = async (c: Context) => {
  const { id } = await c.req.json();

  try {
    const certificate = await Certificate.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!certificate) {
      return sendError(c, 400, "Certificate not found");
    }

    const {
      issuingOrg,
      issueMonth,
      issueYear,
      certificateType,
      certificateLevel,
      certificateName: cName,
    } = await c.req.json();

    await Certificate.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          certificateName: cName,
          issuingOrg,
          issueMonth,
          issueYear: parseInt(issueYear),
          certificateType,
          certificateLevel,
        },
      }
    );

    return sendSuccess(c, 200, "Certificate updated");
  } catch (error) {
    return sendError(c, 400, "Certificate not found");
  }
};

export {
  getCertificates,
  uploadCertificate,
  downloadCertificate,
  deleteCertificate,
  updateCertificate,
};
