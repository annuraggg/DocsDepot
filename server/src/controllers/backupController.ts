import type { Context } from "hono";
import { streamSSE } from "hono/streaming";
import path from "path";
import archiver from "archiver";
import { mkdir, access, unlink } from "fs/promises";
import { createWriteStream, createReadStream } from "fs";
import { format } from "date-fns";
import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import Enrollment from "../models/Enrollment.js";
import Event from "../models/Event.js";
import Feedback from "../models/Feedback.js";
import House from "../models/House.js";
import Notification from "../models/Notification.js";
import { type Token } from "docsdepot-types/Token.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

// Types and Interfaces
interface CollectionConfig {
  name: string;
  model: any;
}

interface BackupMetadata {
  timestamp: string;
  version: string;
  collections: string[];
  platform: string;
}

interface BackupResult {
  filePath: string;
  fileName: string;
}

const BACKUP_CONFIG = {
  collections: [
    { name: "users", model: User },
    { name: "certificates", model: Certificate },
    { name: "enrollments", model: Enrollment },
    { name: "events", model: Event },
    { name: "feedback", model: Feedback },
    { name: "houses", model: House },
    { name: "notifications", model: Notification },
  ] satisfies CollectionConfig[],
} as const;

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await access(dirPath);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

async function createMongoBackup(): Promise<BackupResult> {
  const timestamp = format(new Date(), "yyyy-MM-dd-HH-mm-ss");
  const backupFileName = `backup-${timestamp}.zip`;
  const tempDir = path.join(process.cwd(), "temp");
  const backupPath = path.join(tempDir, backupFileName);

  try {
    await ensureDirectoryExists(tempDir);

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const output = createWriteStream(backupPath);

    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on("close", () => resolve());
      archive.on("error", reject);
      archive.pipe(output);
    });

    const metadata: BackupMetadata = {
      timestamp,
      version: "1.0",
      collections: BACKUP_CONFIG.collections.map((c) => c.name),
      platform: process.platform,
    };
    archive.append(JSON.stringify(metadata, null, 2), {
      name: "metadata.json",
    });

    await Promise.all(
      BACKUP_CONFIG.collections.map(async ({ name, model }) => {
        try {
          // @ts-expect-error
          const data = await model.find();
          archive.append(JSON.stringify(data, null, 2), {
            name: `${name}.json`,
          });
        } catch (error) {
          console.error(`Error backing up ${name}:`, error);
          throw new Error(`Failed to backup ${name} collection`);
        }
      })
    );

    await archive.finalize();
    await archivePromise;

    return { filePath: backupPath, fileName: backupFileName };
  } catch (error) {
    console.error("Backup creation failed:", error);
    throw error;
  }
}

const readFile = async (filePath: string): Promise<Buffer> => {
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      const fileStream = createReadStream(filePath);
      const chunks: Buffer[] = []; // Changed from Uint8Array to Buffer

      fileStream.on("data", (chunk: string | Buffer) => {
        chunks.push(Buffer.from(chunk));
      });

      fileStream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      fileStream.on("error", reject);
    });
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
};

const createBackupWithProgress = async (c: Context): Promise<Response> => {
  try {
    const isAuth = await isAuthorized(c);
    if (!isAuth) {
      logger.error("Unauthorized access to backup endpoint");
      return c.json({ error: "Unauthorized access" }, 403);
    }

    return streamSSE(c, async (stream) => {
      try {
        await stream.write(
          `data: ${JSON.stringify({ status: "started", progress: 0 })}\n\n`
        );

        const { filePath, fileName } = await createMongoBackup();
        const fileData = await readFile(filePath);

        await stream.write(
          `data: ${JSON.stringify({
            status: "completed",
            progress: 100,
            fileData: fileData.toString("base64"),
            fileName,
          })}\n\n`
        );

        try {
          await unlink(filePath);
        } catch (error) {
          console.error("Error cleaning up temp file:", error);
        }
      } catch (error) {
        console.error("Backup creation failed:", error);
        await stream.write(
          `data: ${JSON.stringify({
            status: "error",
            progress: 0,
            error: "Backup creation failed",
          })}\n\n`
        );
      } finally {
        stream.close();
      }
    });
  } catch (error) {
    console.error("SSE endpoint error:", error);
    return c.json({ error: "Failed to create backup" }, 500);
  }
};

async function isAuthorized(c: Context): Promise<boolean> {
  const tokenString = c.req.param()["token"];
  const jwtSecret = process.env["JWT_SECRET"];

  if (!tokenString || !jwtSecret) {
    return false;
  }

  const token = (await jwt.verify(tokenString, jwtSecret)) as unknown as Token;

  if (!token) {
    return false;
  }

  if (!token.role || token.role !== "A") {
    return false;
  }

  if (token.role === "A") {
    return true;
  }

  return false;
}

export default {
  createBackupWithProgress,
};
