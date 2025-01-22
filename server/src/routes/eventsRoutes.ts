import { Hono } from "hono";
import eventController from "../controllers/eventsController.js";

const router = new Hono();

router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);
router.post("/", eventController.createEvent);
router.post("/:id/register", eventController.registerForEvent);
router.post("/:id/deregister", eventController.deregisterForEvent);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

export default router;
