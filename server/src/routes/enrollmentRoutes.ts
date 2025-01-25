import { Hono } from "hono";
import enrollmentController from "../controllers/enrollmentController.js";

const app = new Hono();

app.post("/", enrollmentController.createEnrollment);
app.get("/", enrollmentController.getEnrollments);
app.post("/accept", enrollmentController.acceptEnrollment);

export default app;
