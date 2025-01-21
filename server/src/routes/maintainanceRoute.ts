import { Hono } from "hono";
import maintController from "../controllers/maintainanceController.js";

const router = new Hono();

router.post("/", maintController.toggleMaintainance);
router.get("/", maintController.getMaintainanceMode);

export default router;
