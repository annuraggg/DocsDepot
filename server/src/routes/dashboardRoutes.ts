import { Hono } from "hono";
import dashboardController from "../controllers/dashboardController.js";

const app = new Hono();

app.get("/student", dashboardController.getStudentDashboard);

export default app;
