import { Hono } from "hono";
import NotifController from "../controllers/notificationController.js";

const notificationRoutes = new Hono();

notificationRoutes.get("/", NotifController.receiveNotifications);
notificationRoutes.delete("/", NotifController.clearNotifications);

export default notificationRoutes;
