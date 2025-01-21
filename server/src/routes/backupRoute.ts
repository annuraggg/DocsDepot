import { Hono } from "hono";
import backupController from "../controllers/backupController";

const app = new Hono();

app.get("/backup-with-progress/:token", backupController.createBackupWithProgress);

export default app;
